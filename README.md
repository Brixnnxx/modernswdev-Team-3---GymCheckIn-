# modernswdev-Team-3---GymCheckIn-

##Team Members
Jake Riddle - email: briddle@ualr.edu username: briddle-UALR
Carlos Trevino - email: ctrevino@ualr.edu username: ctrevino32
Alec Fox - email: afox1@ualr.edu username: afox-CPSC
Brianna Beasly - Email: bdbeasley1@ualr.edu username: Brixnnxx

## Tech Stack
Frontend: HTML, CSS, JavaScript
Backend/API: Node.js and Express(JavaScript)
Database: SQL (PostgreSQL)
Payments: Stripe or Square

## Mission Statement
Our goal is to create a web application that allows gym members to check in when they arrive at the facility by entering their information or scanning an ID. The system keeps track of each member's visit history and automatically verifies whether their membership is active or expired. It's designed to streamline the check-in process for both gym staff and members, replacing the need for manual sign-in sheets or outdated paper records.

## Define Our Project

## The Problem
Many gyms still rely on scattered tools (spreadsheets, paper sign-in sheets, or basic POS systems) that do not connect member profiles, check-in history, appointments, and payments in one place. Some existing solutions are also overpriced or overly complex for small gyms. This creates slow check-ins, inconsistent recordkeeping, and limited visibility into attendance and revenue.

## The Solution
This project is a Gym Check-In & Billing Web App that centralizes member management, check-ins, appointments, and transaction history in a single system. Staff can quickly look up members, check them in, track visit history, schedule and manage appointments (including confirmed/arrived status), and convert completed appointments into transactions. The system is backed by a relational SQL database and built with HTML and JavaScript for the user interface.

## Key Features (Initial Backlog)
* Member management: create/edit member profiles (contact info, address, emergency contact, status, notes, photo).
* Fast check-in: search or scan QR/barcode (member_code) and record check-ins (kiosk/manual/QR); block inactive/frozen members.
* Appointment scheduling: calendar/list view with trainer assignment, confirmed + arrived checkboxes, and appointment status tracking.
* POS + payments: charge memberships, services, and items; support multiple payment types (cash, card on file, new card token).
* Appointment-to-transaction conversion: completed training appointments can be billed exactly once (prevents double billing).
* Transaction history / audit trail: event log for created/paid/refunded/voided/note-added actions for accountability.
* Membership plans: support plan selection (regular/senior/etc.) and membership lifecycle (active/paused/canceled/expired).

## User Personas
* Front Desk Staff (Worker): performs member lookup, check-ins, basic edits, and POS transactions; needs speed and clarity.
* Trainer (Worker): manages appointments, marks confirmed/arrived/completed, and triggers training billing when sessions are completed.
*Manager/Admin (optional expansion): manages worker access/roles, reviews reports (attendance and revenue), and audits transactions.

## Team Workflow (Scrum Simulation)

## Communication
Slack will be used for daily syncs and quick updates. The Scrum Master will create a team channel and post daily prompts:
* What did you complete yesterday?
* What are you working on today?
* Any blockers?

## Meeting Cadence
* Sprint Planning: at least 1x per week (recommended 2x per week).
* Sprint Retrospective: 1x per week.
* Roles rotate every 2 weeks so each teammate practices leadership.

## Branching Strategy & Pull Requests
* Use feature branches from main (example: feature/member-management, feature/checkin-flow).
* Keep branches focused (one user story or small set of related tasks per branch).
* Every change to main must be merged through a Pull Request and reviewed by another teammate.
* Each student owns a different section of README.md or ROLES.md to ensure visible contributions.
