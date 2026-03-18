# Planning Guide

A professional clinic operations management system that enables healthcare staff to manage patient records and appointments with enterprise-grade validation and workflow enforcement.

**Experience Qualities**: 
1. **Professional** - Clean, structured interface that conveys trust and reliability appropriate for healthcare operations
2. **Efficient** - Streamlined workflows that minimize clicks and cognitive load for busy clinic staff
3. **Predictable** - Consistent patterns and clear feedback that prevent errors and build confidence

**Complexity Level**: Light Application (multiple features with basic state)
  - This is a focused clinic management tool with patient and appointment management, featuring validation logic and state management but not requiring complex multi-view navigation or advanced reporting features.

## Essential Features

### Patient Registration
- **Functionality**: Create and manage patient records with personal and contact information
- **Purpose**: Maintain accurate patient database for appointment scheduling and clinic operations
- **Trigger**: Staff clicks "Add Patient" button in the patient management section
- **Progression**: Click Add Patient → Fill form (name, email, phone, date of birth) → Validate input → Submit → Confirmation toast → Patient appears in list
- **Success criteria**: Patient is persisted, appears in the patient list immediately, and can be selected for appointment booking

### Appointment Booking
- **Functionality**: Schedule appointments with double-booking prevention and status management
- **Purpose**: Coordinate clinic resources and prevent scheduling conflicts
- **Trigger**: Staff clicks "Book Appointment" button
- **Progression**: Click Book Appointment → Select patient → Choose doctor → Pick date/time → System validates (no conflicts) → Submit → Confirmation → Appointment appears in schedule
- **Success criteria**: Appointment is created only if no conflicts exist, status transitions follow valid workflow, and real-time validation prevents double bookings

### Appointment Status Management
- **Functionality**: Update appointment status through valid state transitions (Scheduled → Confirmed → Completed/Cancelled)
- **Purpose**: Track appointment lifecycle and maintain accurate clinic schedules
- **Trigger**: Staff clicks status dropdown on an appointment card
- **Progression**: Select appointment → Click status → Choose new status → System validates transition → Update applied → Visual feedback
- **Success criteria**: Only valid status transitions are allowed, invalid transitions show clear error messages, and status changes persist immediately

### Patient Viewing & Search
- **Functionality**: Browse all registered patients with key information displayed
- **Purpose**: Quick access to patient records for appointment booking and reference
- **Trigger**: Patient list loads on application start and updates in real-time
- **Progression**: Load application → Patient list appears → Add/view patients → List updates automatically
- **Success criteria**: All patients display correctly, list updates reflect changes immediately without page refresh

### Appointment Calendar View
- **Functionality**: Display scheduled appointments chronologically with patient and doctor information
- **Purpose**: Provide visibility into clinic schedule and resource allocation
- **Trigger**: Appointment list loads on application start
- **Progression**: Load application → Appointments display by date/time → Filter/sort → View details → Update status
- **Success criteria**: Appointments sort chronologically, show all relevant details, and update in real-time

## Edge Case Handling
- **Double Booking Prevention**: System validates before submission and shows clear error message if doctor is unavailable at selected time
- **Invalid Status Transitions**: Prevents illogical state changes (e.g., Cancelled → Completed) with explanatory error messages
- **Missing Patient Data**: Form validation requires all fields before enabling submit button
- **Date/Time Conflicts**: Real-time validation checks as user selects time slot and highlights conflicts immediately
- **Empty States**: Shows helpful messages and call-to-action when no patients or appointments exist

## Design Direction
The design should evoke confidence, clarity, and efficiency - appropriate for a healthcare operations environment where accuracy and speed are critical.

## Color Selection
A professional healthcare-inspired palette that conveys trust, cleanliness, and clinical precision while maintaining visual warmth to avoid sterility.

- **Primary Color**: Medical blue `oklch(0.55 0.15 250)` - Conveys trust, professionalism, and healthcare authority; used for primary actions and navigation
- **Secondary Colors**: 
  - Cool gray `oklch(0.45 0.02 250)` for secondary elements and reduced emphasis
  - Success green `oklch(0.65 0.15 145)` for confirmed/completed states
  - Warning amber `oklch(0.70 0.13 70)` for pending states
  - Alert red `oklch(0.60 0.20 25)` for cancelled/error states
- **Accent Color**: Vibrant teal `oklch(0.62 0.14 195)` - Modern, approachable highlight for CTAs and important interactive elements
- **Foreground/Background Pairings**:
  - Primary Blue (oklch(0.55 0.15 250)): White text (oklch(0.98 0 0)) - Ratio 7.2:1 ✓
  - Accent Teal (oklch(0.62 0.14 195)): White text (oklch(0.98 0 0)) - Ratio 6.1:1 ✓
  - Background (oklch(0.97 0.005 250)): Dark text (oklch(0.25 0.02 250)) - Ratio 13.5:1 ✓
  - Alert Red (oklch(0.60 0.20 25)): White text (oklch(0.98 0 0)) - Ratio 5.8:1 ✓

## Font Selection
Typography should balance clinical professionalism with modern readability, using a clean sans-serif that works well in data-dense interfaces.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Semi-Bold / 32px / -0.02em letter spacing / 1.2 line height
  - H2 (Section Headers): Inter Semi-Bold / 24px / -0.01em letter spacing / 1.3 line height
  - H3 (Card Headers): Inter Medium / 18px / normal letter spacing / 1.4 line height
  - Body (Forms/Lists): Inter Regular / 15px / normal letter spacing / 1.5 line height
  - Small (Labels/Meta): Inter Medium / 13px / 0.01em letter spacing / 1.4 line height
  - Button Text: Inter Medium / 14px / 0.01em letter spacing / 1.0 line height

## Animations
Animations should be subtle and purposeful, reinforcing actions without delaying workflows. Success states deserve brief moments of delight while transitions maintain context.

- Form submission success: 300ms scale + fade celebration with checkmark icon
- Status changes: 200ms smooth color transition to new state
- Card interactions: 150ms lift on hover with subtle shadow increase
- Modal entry/exit: 250ms fade + gentle scale for contextual overlay
- List item additions: 300ms slide-in from top with slight fade
- Error states: 200ms gentle shake to draw attention without disrupting flow

## Component Selection
- **Components**: 
  - Shadcn Card for patient and appointment display with subtle borders and hover states
  - Shadcn Dialog for patient registration and appointment booking forms (modal workflow)
  - Shadcn Button with distinct variants (default for primary, outline for secondary, destructive for cancel)
  - Shadcn Select for doctor selection and status dropdowns with clear visual hierarchy
  - Shadcn Input with focus states for form fields, using accent color for active borders
  - Shadcn Badge for appointment status display with semantic color coding
  - Shadcn Separator for visual section division without harsh lines
  - Toast (Sonner) for success/error feedback positioned top-right
- **Customizations**: 
  - Custom appointment timeline component showing chronological flow with connecting lines
  - Status badge color variants mapped to appointment states (scheduled/confirmed/completed/cancelled)
  - Enhanced form validation with inline error display and field-level feedback
- **States**: 
  - Buttons: Solid primary (medical blue bg) for main actions, outline secondary for cancel/back, disabled state with reduced opacity and no hover
  - Inputs: Default border, accent teal focus ring with 2px outline, error state with red border and icon
  - Cards: Subtle hover elevation (shadow-md to shadow-lg transition), active state with accent border
  - Status badges: Color-coded backgrounds with contrasting text, no interaction states (display only)
- **Icon Selection**: 
  - Plus icon for add patient/appointment actions
  - CalendarBlank for appointment booking
  - User for patient records
  - Clock for appointment times
  - Check for confirmed/completed states
  - X for cancelled states
  - Warning for validation errors
- **Spacing**: 
  - Container padding: p-6 (24px) on desktop, p-4 (16px) on mobile
  - Card padding: p-6 with gap-4 for internal content
  - Form fields: gap-4 between fields, gap-6 between sections
  - Grid layouts: gap-6 for card grids on desktop, gap-4 on mobile
  - Section margins: mb-8 between major sections, mb-4 between subsections
- **Mobile**: 
  - Stack side-by-side sections vertically on mobile (<768px)
  - Full-width dialogs on mobile with bottom sheet style for forms
  - Collapsible patient/appointment cards with expandable details
  - Simplified table views to card lists with key info prioritized
  - Touch-friendly target sizes (min 44x44px) for all interactive elements
  - Single-column layout for forms on mobile with increased input height
