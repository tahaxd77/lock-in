**Project Title: FocusFriends**
-------------------------------

**Status:** Draft | **Target Launch:** Q1 2026

### **1\. Executive Summary**

**FocusFriends** is a web-based productivity hub designed for a specific group of friends to study together virtually. Unlike solo productivity apps, FocusFriends leverages social accountability by making study activities and progress visible to the group in real-time, encouraging collective focus and healthy competition.

### **2\. Target Audience**

*   University students (specifically those in technical fields like CS/SE).
    
*   Collaborative study groups working on complex projects (e.g., Final Year Projects).
    
*   Remote learners who feel isolated during deep work sessions.
    

### **3\. Functional Requirements**

#### **Core: Activity Logging & Visibility**

*   **Live Session Tracker:** Users can start a "Focus Session," selecting a specific task or subject.
    
*   **Privacy Toggle:** A "Delayed Visibility" feature where users can log an activity now but choose a specific time (e.g., end of day) for it to appear on their friends' feeds.
    
*   **Activity Feed:** A chronological feed showing what friends have accomplished or are currently working on.
    

#### **Social & Accountability**

*   **Focus Lobbies:** Virtual rooms where users’ profile pictures glow when they are active.
    
*   **Nudge System:** One-click interactions (e.g., "High-Five," "Focus Up," "Coffee Break") to interact with friends without typing.
    
*   **Leaderboards:** Weekly rankings based on "Deep Work" hours (sessions > 50 minutes).
    

#### **Study Tools**

*   **Group Pomodoro:** A synced timer where a group leader can set work/break intervals for everyone in the lobby.
    
*   **Resource Vault:** A shared repository for uploading project files, links, and PDF notes.
    

### **4\. User Experience (UX) & Design**

The interface should be "Low-Stimulus" to avoid becoming a distraction itself.

*   **Dashboard:** A clean "Focus Mode" that hides the social feed, showing only the timer and current task.
    
*   **Visual Feedback:** Use a contribution heatmap (GitHub style) to visualize the group’s collective effort over time.
    

### **5\. Technical Specifications**

**ComponentTechnologyRationaleFrontend**Next.js / ReactFast rendering and excellent SEO/routing.**Styling**Tailwind CSSRapid UI development with a clean, modern aesthetic.**Backend/Database**SupabaseHandles Auth, SupabasePostgreSQL, and Realtime listeners for the "Live" status.**State Management**Zustand or React ContextTo manage the global timer and user session states.

### **6\. Data Model (Draft)**

**TableFieldsProfiles**id, username, avatar\_url, total\_focus\_hours, current\_status**Sessions**id, user\_id, subject, start\_time, end\_time, is\_public\_now**Nudges**id, sender\_id, receiver\_id, type, created\_at

### **7\. Success Metrics**

*   **Average Session Duration:** Aiming for > 45 minutes of uninterrupted work.
    
*   **Daily Active Users (DAU):** Percentage of the friend group logging in daily.
    
*   **Nudge Engagement:** Number of peer-to-peer encouragements sent per session.
    

