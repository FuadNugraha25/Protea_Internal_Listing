# How the Profile System Works

## 📋 Overview
The profile system automatically saves agent information to Supabase database. When an agent logs in, their profile is automatically created or retrieved from the database.

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT LOGS IN                            │
│              (Email: john.doe@protea.com)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Dashboard/Profile Page Loads                   │
│         Calls: getOrCreateProfile(user)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Check if profile exists in database                │
│  Query: SELECT * FROM profiles WHERE id = user.id          │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ✅ Found                      ❌ Not Found
         │                           │
         ▼                           ▼
┌──────────────────┐    ┌─────────────────────────────────────┐
│ Return existing  │    │ STEP 2: Generate name from email    │
│ profile data      │    │ "john.doe@protea.com"               │
│                  │    │ → "John Doe"                         │
└──────────────────┘    └──────────────┬──────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────────────┐
                       │ STEP 3: Create new profile            │
                       │ INSERT INTO profiles:                 │
                       │ - id: user.id                         │
                       │ - email: user.email                    │
                       │ - name: "John Doe"                    │
                       │ - full_name: "John Doe"                │
                       │ - created_at: NOW()                   │
                       └──────────────┬───────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────────────┐
                       │ STEP 4: Save to Supabase              │
                       │ Profile saved in database             │
                       └──────────────┬───────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────────────┐
                       │ STEP 5: Display name in UI            │
                       │ Dashboard shows: "Welcome, John Doe"  │
                       └───────────────────────────────────────┘
```

---

## 🎯 Step-by-Step Process

### **Step 1: Agent Logs In**
- Agent enters email and password
- Supabase authenticates the user
- User object is created with `id`, `email`, etc.

### **Step 2: Dashboard/Profile Page Loads**
- When dashboard or profile page loads, it calls `getOrCreateProfile(user)`
- This function is in `src/utils/profileUtils.js`

### **Step 3: Check Database**
```javascript
// Try to get existing profile
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

**Two scenarios:**
- ✅ **Profile exists**: Return the existing profile data
- ❌ **Profile doesn't exist**: Continue to Step 4

### **Step 4: Generate Name from Email**
```javascript
// Example: "john.doe@protea.com" → "John Doe"
emailToName(user.email)
```

**How it works:**
1. Takes email: `john.doe@protea.com`
2. Extracts username: `john.doe`
3. Splits by dots/hyphens/underscores: `["john", "doe"]`
4. Capitalizes each word: `["John", "Doe"]`
5. Joins with spaces: `"John Doe"`

### **Step 5: Create Profile in Database**
```javascript
const newProfile = {
  id: user.id,              // Links to auth.users
  email: user.email,        // "john.doe@protea.com"
  name: "John Doe",         // Generated name
  full_name: "John Doe",    // Same as name
  created_at: NOW(),        // Timestamp
  updated_at: NOW()         // Timestamp
};

// Insert into database
await supabase.from('profiles').insert(newProfile);
```

### **Step 6: Display in UI**
- Dashboard shows: **"Welcome, John Doe"**
- Profile page shows agent information

---

## 🗄️ Database Structure

### **profiles Table**
```sql
profiles
├── id (UUID)           → Links to auth.users(id)
├── email (TEXT)        → Agent's email
├── name (TEXT)         → Display name (e.g., "John Doe")
├── full_name (TEXT)    → Full name
├── phone (TEXT)        → Optional phone number
├── avatar_url (TEXT)   → Optional profile picture URL
├── bio (TEXT)          → Optional biography
├── created_at          → When profile was created
└── updated_at          → Last update timestamp
```

### **Security (Row Level Security)**
- ✅ Users can only view/edit their own profile
- ✅ Users can create their own profile
- ✅ Automatic timestamp updates

---

## 💡 Key Features

### **1. Automatic Profile Creation**
- No manual setup needed
- Profile created on first login
- Name automatically generated from email

### **2. Persistent Storage**
- All data saved in Supabase
- Accessible from any device
- Survives browser data clearing

### **3. Smart Name Generation**
- Converts emails to readable names
- Examples:
  - `john.doe@protea.com` → `John Doe`
  - `siti-nurhaliza@protea.com` → `Siti Nurhaliza`
  - `ahmad_fauzi@protea.com` → `Ahmad Fauzi`

### **4. Fallback System**
- If database fails, uses email username
- If name not found, generates from email
- Always shows something, never blank

---

## 🔧 How to Use

### **For Developers:**

**Get or create profile:**
```javascript
import { getOrCreateProfile } from '../utils/profileUtils';

const profile = await getOrCreateProfile(user);
// Returns: { id, email, name, full_name, ... }
```

**Update profile:**
```javascript
import { updateProfile } from '../utils/profileUtils';

await updateProfile(userId, {
  name: "New Name",
  phone: "+62 812-3456-7890"
});
```

**Get profile:**
```javascript
import { getProfile } from '../utils/profileUtils';

const { data } = await getProfile(userId);
```

### **For Admins:**

1. **Run SQL script** (`PROFILES_TABLE_SETUP.sql`) in Supabase SQL Editor
2. **View all profiles** in Supabase Table Editor
3. **Query profiles** using SQL:
   ```sql
   SELECT * FROM profiles;
   ```

---

## 📊 Example Scenarios

### **Scenario 1: New Agent First Login**
1. Agent logs in with `maria.santoso@protea.com`
2. System checks database → No profile found
3. System generates name: `Maria Santoso`
4. System creates profile in database
5. Dashboard shows: **"Welcome, Maria Santoso"**

### **Scenario 2: Returning Agent**
1. Agent logs in with `john.doe@protea.com`
2. System checks database → Profile found!
3. System retrieves: `{ name: "John Doe", ... }`
4. Dashboard shows: **"Welcome, John Doe"**
5. No database insert needed (faster!)

### **Scenario 3: Admin Sets Name Manually**
1. Admin updates profile in Supabase: `name = "Johnny Doe"`
2. Agent logs in
3. System retrieves profile → Gets `"Johnny Doe"`
4. Dashboard shows: **"Welcome, Johnny Doe"**
5. Manual name takes priority over auto-generated

---

## ✅ Benefits

1. **Zero Manual Setup** - Profiles created automatically
2. **Consistent Data** - Same profile across all devices
3. **Scalable** - Works with 1 or 1000 agents
4. **Secure** - Row Level Security protects data
5. **Fast** - Cached after first creation
6. **Flexible** - Can add more fields later (phone, bio, etc.)

---

## 🚀 Next Steps

1. ✅ Run `PROFILES_TABLE_SETUP.sql` in Supabase
2. ✅ Test with a new agent login
3. ✅ Verify profile appears in database
4. ✅ Check dashboard shows correct name

That's it! The system works automatically. 🎉

