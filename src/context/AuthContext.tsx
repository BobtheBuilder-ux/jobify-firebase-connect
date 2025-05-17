
import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, FieldValue, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: 'employer' | 'jobSeeker';
  createdAt: Timestamp | Date;
  profile?: {
    [key: string]: any;
  };
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: 'employer' | 'jobSeeker') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (role?: 'employer' | 'jobSeeker') => Promise<void>;
  logout: () => Promise<void>;
  isEmployer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (user: User) => {
    if (!user) return null;
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    
    return null;
  };

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    displayName: string,
    role: 'employer' | 'jobSeeker'
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      displayName,
      email: user.email,
      role,
      createdAt: serverTimestamp(),
      profile: {}
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    // Convert to UserData type with type assertion
    setUserData({...userData, createdAt: new Date()} as UserData);
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async (role?: 'employer' | 'jobSeeker') => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists() && role) {
      // Create user document if it doesn't exist
      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        role,
        createdAt: serverTimestamp(),
        profile: {}
      };
      
      await setDoc(userDocRef, userData);
      // Convert to UserData type with type assertion
      setUserData({...userData, createdAt: new Date()} as UserData);
    } else if (userDoc.exists()) {
      setUserData(userDoc.data() as UserData);
    }
  };

  // Log out
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const data = await fetchUserData(user);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isEmployer = userData?.role === 'employer';

  const value = {
    currentUser,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    isEmployer
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
