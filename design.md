**Design System Document: FocusFriends**
========================================

**1\. Visual Identity & Aesthetic**
-----------------------------------

*   **Theme:** "Stealth Productivity" — A deep, high-contrast dark mode that reduces eye strain and emphasizes focus.
    
*   **Core Style:** Bento Grid layout with subtle "Glassmorphism" (semi-transparent backgrounds with background-blur).
    
*   **Color Palette (Hex Codes):**
    
    *   **Primary Background:** #060606 (True Black)
        
    *   **Surface/Cards:** #1D1D1D (Dark Grey) with border: 1px solid #2D2D2D
        
    *   **Accent 1 (Energy/Focus):** #7CFF22 (Lime Green — used for timers and "Live" status)
        
    *   **Accent 2 (Action/Urgency):** #FE5405 (Deep Orange — used for breaks or alerts)
        
    *   **Typography:** #DCDCDD (Off-white for readability)
        

**2\. Layout Architecture (The Bento Grid)**
--------------------------------------------

Divide your dashboard into distinct modules to keep the interface organized:

### **A. Hero Module (The Focus Engine)**

*   **Placement:** Top Left or Center.
    
*   **Design:** A large, centered digital timer in the Lime Green accent.
    
*   **Interaction:** A prominent "Start Session" button that transforms into a "Stop/Pause" state. Include a small dropdown for selecting the subject (e.g., "Waning Rift Project" or "Compiler Design").
    

### **B. Social Presence Module (The "Lobby")**

*   **Placement:** Right Sidebar.
    
*   **Design:** Vertical list of friends.
    
*   **Visual Cue:** If a friend is studying, their avatar has a **Lime Green glow/ring**. If they are on a break, use the **Orange accent**.
    
*   **Nudge:** Small icon buttons (Coffee, Fire, High-five) next to each active friend.
    

### **C. Analytics Module (Weekly Insights)**

*   **Placement:** Bottom Left.
    
*   **Design:** A bar chart showing total focus hours over the last 7 days.
    
*   **Tech Hint:** Use Recharts or Chart.js with a gradient fill (#7CFF22 to transparent).
    

### **D. The "Timeline" (Daily Activity)**

*   **Placement:** Bottom Center/Right.
    
*   **Design:** A vertical or horizontal timeline showing when you and your friends logged sessions. This is where your **"Delayed Visibility"** feature lives—show upcoming "unlocks" of friends' activity as blurred or locked icons.
    

**3\. UI Components & Specs**
-----------------------------

### **Typography**

*   **Headings:** Sans-serif, Bold (Inter or Geist).
    
*   **Timer Display:** Monospace font (JetBrains Mono) to prevent text jumping as numbers change.
    

### **Buttons & Inputs**

*   **Style:** Rounded-lg (8px to 12px), subtle inner shadow.
    
*   **Hover State:** Increase border brightness or add a soft glow using box-shadow: 0 0 15px rgba(124, 255, 34, 0.3).
    

### **Glassmorphism Effect (Tailwind Classes)**

Apply this to your cards to match the inspiration:

bg-\[#1D1D1D\]/80 backdrop-blur-md border border-white/10

**4\. Interaction Design (UX)**
-------------------------------

1.  **Entrance:** When a user logs in, the dashboard should fade in.
    
2.  **Focus Mode:** When the timer starts, the rest of the dashboard (Social Feed and Analytics) should dim to 30% opacity, leaving only the timer and the current task fully visible.
    
3.  **Real-time Feedback:** When a friend sends a "Nudge," a small toast notification appears in the corner with a sound cue (like a soft "ping").
    

**5\. Technical Implementation Map**
------------------------------------

**UI ElementCSS/Component StrategyGrid System**display: grid with grid-template-areas for the Bento layout.**Glow Effects**CSS filter: drop-shadow() for active avatars.**Charts**recharts with customized Tooltip to match the dark theme.**Animations**framer-motion for smooth transitions between "Idle" and "Studying" states.