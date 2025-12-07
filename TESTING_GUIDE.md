# Complete Testing Guide - Skitt Feature Flags & A/B Testing

## 🎯 The Complete Concept Explained

### What is A/B Testing?
A/B testing lets you test two different versions of a feature to see which one performs better. 

**Real-world example:**
- You want to test if a **green checkout button** (Variant B) converts better than a **blue checkout button** (Variant A)
- You show 50% of users the blue button (Variant A) and 50% the green button (Variant B)
- You track which version gets more clicks
- The winner becomes the default

### How It Works in Your App

1. **Feature Flag** = The toggle/switch (e.g., "checkout-button-color")
2. **Experiment** = The A/B test configuration (e.g., "Button Color Test")
3. **Users** = People who will see different versions
4. **Variants** = The different versions (A = blue, B = green)
5. **Assignment** = Which user sees which variant (automatic based on percentages)

---

## 📋 Step-by-Step Testing Guide

### Step 1: Create a Feature Flag

**What it is:** A feature flag is like a light switch for a feature.

**How to test:**
1. Go to **"Feature Flags"** page
2. Click **"Create Flag"**
3. Fill in:
   - **Key:** `new-checkout-button` (must be unique, lowercase, no spaces)
   - **Name:** `New Checkout Button`
   - **Description:** `Testing green vs blue checkout button`
   - **Enabled:** ✅ Check this box
4. Click **"Create"**

**Result:** You now have a feature flag that can be toggled on/off.

---

### Step 2: Create Users

**What it is:** Users are the people who will see your experiment.

**How to test:**
1. Go to **"Users"** page
2. Click **"Create User"**
3. Fill in:
   - **Name:** `John Doe`
   - **Email:** `john@example.com`
   - **Attributes:** Leave empty (or add JSON like `{"plan": "premium"}`)
4. Click **"Create"**
5. Repeat to create at least 3-5 users:
   - User 2: `Jane Smith`, `jane@example.com`
   - User 3: `Bob Wilson`, `bob@example.com`
   - etc.

**Result:** You now have users who can be assigned to variants.

---

### Step 3: Create an Experiment

**What it is:** An experiment links a feature flag to an A/B test with variant percentages.

**How to test:**
1. Go to **"Experiments"** page
2. Click **"Create Experiment"**
3. Fill in:
   - **Feature Flag:** Select `New Checkout Button` (the flag you created)
   - **Name:** `Checkout Button Color Test`
   - **Description:** `Testing if green button converts better than blue`
   - **Variant A %:** `50` (50% of users see blue button)
   - **Variant B %:** `50` (50% of users see green button)
   - **Status:** Select `running` (this makes it active)
   - **Start Date:** Today's date/time (optional)
   - **End Date:** Leave empty or set future date (optional)
4. Click **"Create"**

**Result:** You now have an active A/B test running!

**Important:** The percentages must add up to 100% (50% + 50% = 100% ✅)

---

### Step 4: Test Which Variant Each User Sees

**What it is:** This shows you which version (A or B) each user will see.

**How to test:**
1. Go to **"Test Variant"** page (in navbar)
2. **Select Feature Flag:** Choose `New Checkout Button`
3. **Select User:** Choose `John Doe`
4. Click **"Test Variant Assignment"**

**What you'll see:**
- **Flag Enabled:** Yes ✅
- **Variant:** Variant A or Variant B
- **Active Experiment:** Checkout Button Color Test

**This means:**
- If John sees **Variant A** → He will see the **blue button** (original/control)
- If John sees **Variant B** → He will see the **green button** (new/test)

5. **Test all your users:**
   - Test User 1 (John) → See which variant
   - Test User 2 (Jane) → See which variant
   - Test User 3 (Bob) → See which variant
   - etc.

**Result:** You'll see that users are automatically split between Variant A and Variant B based on the 50/50 split.

**Key Point:** The same user will ALWAYS see the same variant (deterministic assignment).

---

### Step 5: View Experiment Assignments

**What it is:** See all users assigned to an experiment and their variants.

**How to test:**
1. Go to **"Experiments"** page
2. Find your experiment: `Checkout Button Color Test`
3. Click **"View Assignments"** button

**What you'll see:**
- **Statistics:**
  - Variant A: X users (X%)
  - Variant B: Y users (Y%)
  - Total Users: Z
- **User List:**
  - John Doe → Variant A
  - Jane Smith → Variant B
  - Bob Wilson → Variant A
  - etc.

**Result:** You can see exactly which users are in which variant group.

---

## 🧪 Complete Testing Scenario

Let's walk through a complete real-world scenario:

### Scenario: Testing a New Homepage Design

**Goal:** Test if a new homepage layout increases user engagement.

---

### Step 1: Create the Feature Flag

```
Key: new-homepage-layout
Name: New Homepage Layout
Description: Testing new homepage design vs old design
Enabled: ✅ Yes
```

**Why:** This flag controls whether the new homepage is shown.

---

### Step 2: Create Test Users

Create 10 users:
- User 1: Alice
- User 2: Bob
- User 3: Charlie
- ... (up to User 10)

**Why:** You need users to test the variants on.

---

### Step 3: Create the Experiment

```
Feature Flag: New Homepage Layout
Name: Homepage Design A/B Test
Description: Testing new layout vs old layout
Variant A: 50% (old design - control group)
Variant B: 50% (new design - test group)
Status: running
```

**Why:** This splits users 50/50 between old and new designs.

---

### Step 4: Test Each User

Go to **"Test Variant"** and test each user:

- Alice → Variant A (sees old design)
- Bob → Variant B (sees new design)
- Charlie → Variant A (sees old design)
- ... (continues based on 50/50 split)

**Why:** This shows you which users see which version.

---

### Step 5: View All Assignments

Go to **"View Assignments"** for your experiment:

**You'll see:**
- 5 users in Variant A (old design)
- 5 users in Variant B (new design)
- Total: 10 users

**Why:** This gives you a complete overview of the experiment distribution.

---

## 🎨 Real Application Usage

### How Your Application Code Would Use This

In your actual application (not the admin panel), you would:

1. **Check the flag for a user:**
   ```javascript
   // When user visits homepage
   const result = await fetch(`/api/flags/${flagId}/evaluate/${userId}`);
   const { variant, flagEnabled } = await result.json();
   
   if (flagEnabled && variant === 'B') {
     // Show new homepage design
     renderNewHomepage();
   } else {
     // Show old homepage design
     renderOldHomepage();
   }
   ```

2. **Track events:**
   ```javascript
   // When user clicks something
   await fetch('/api/metrics/events', {
     method: 'POST',
     body: JSON.stringify({
       flag_id: flagId,
       user_id: userId,
       event_type: 'button_clicked',
       metadata: { button: 'checkout' }
     })
   });
   ```

---

## 📊 Understanding the Results

### What Each Variant Means

- **Variant A:** Usually the **control group** (original/current version)
- **Variant B:** Usually the **test group** (new version being tested)

### How Assignment Works

The system uses a **deterministic hash** based on:
- Experiment ID
- User ID

This means:
- ✅ Same user always gets same variant
- ✅ Distribution matches your percentages (50/50, 70/30, etc.)
- ✅ Fair and random assignment

### Example Distribution

If you have:
- 10 users
- 50% Variant A, 50% Variant B

You might get:
- Variant A: 5 users (Alice, Charlie, Eve, Grace, Ian)
- Variant B: 5 users (Bob, David, Frank, Henry, Jack)

---

## 🔍 Testing Checklist

Use this checklist to test your entire system:

### ✅ Feature Flags
- [ ] Create a feature flag
- [ ] Enable/disable a flag
- [ ] Edit a flag
- [ ] Delete a flag
- [ ] View all flags

### ✅ Users
- [ ] Create a user
- [ ] Create multiple users (at least 5)
- [ ] Edit a user
- [ ] Delete a user
- [ ] View all users

### ✅ Experiments
- [ ] Create an experiment
- [ ] Link experiment to a flag
- [ ] Set variant percentages (must total 100%)
- [ ] Set experiment status to "running"
- [ ] View all experiments
- [ ] Edit an experiment
- [ ] Delete an experiment

### ✅ Variant Testing
- [ ] Go to "Test Variant" page
- [ ] Select a flag with an active experiment
- [ ] Select a user
- [ ] See which variant the user is assigned to
- [ ] Test multiple users (should see different variants)
- [ ] Test same user twice (should get same variant)

### ✅ View Assignments
- [ ] Go to Experiments page
- [ ] Click "View Assignments" on an experiment
- [ ] See statistics (Variant A count, Variant B count, percentages)
- [ ] See list of all users and their variants
- [ ] Verify distribution matches percentages

### ✅ Dashboard
- [ ] View dashboard
- [ ] See total flags count
- [ ] See total users count
- [ ] See total experiments count
- [ ] See top flags by usage

---

## 🚀 Quick Start Testing (5 Minutes)

1. **Create 1 Flag:**
   - Key: `test-feature`
   - Name: `Test Feature`
   - Enabled: ✅

2. **Create 3 Users:**
   - User 1: `Test User 1`
   - User 2: `Test User 2`
   - User 3: `Test User 3`

3. **Create 1 Experiment:**
   - Flag: `Test Feature`
   - Name: `My First Test`
   - Variant A: 50%
   - Variant B: 50%
   - Status: `running`

4. **Test Variants:**
   - Go to "Test Variant"
   - Test each of your 3 users
   - See which variant each gets

5. **View Assignments:**
   - Go to Experiments
   - Click "View Assignments"
   - See all 3 users and their variants

**Done!** You've tested the complete A/B testing flow! 🎉

---

## 💡 Pro Tips

1. **Always set experiment status to "running"** for it to work
2. **Percentages must total 100%** (e.g., 50% + 50%, or 70% + 30%)
3. **Same user = same variant** (deterministic assignment)
4. **Test with multiple users** to see the distribution
5. **Use "Test Variant" page** to preview what users will see
6. **Use "View Assignments"** to see the complete experiment overview

---

## 🐛 Troubleshooting

### "No variant shown"
- Make sure experiment status is "running"
- Make sure flag is enabled
- Make sure experiment is linked to the flag

### "All users get same variant"
- This is normal! Assignment is deterministic
- Test with more users to see distribution
- Check percentages add up to 100%

### "Can't see assignments"
- Make sure you've tested the variant for users first
- Assignments are created when you test/evaluate
- Try testing a few users, then view assignments

---

## 📝 Summary

**The Complete Flow:**
1. Create Flag → Toggle for feature
2. Create Users → People to test on
3. Create Experiment → A/B test configuration
4. Test Variants → See which user sees which version
5. View Assignments → See complete experiment overview

**The Concept:**
- Feature Flag = What you're testing
- Experiment = How you split users (A vs B)
- Variants = The different versions (A = old, B = new)
- Assignment = Which user sees which version (automatic)

**The Result:**
You can now test two versions of a feature and see which performs better! 🚀

