## ares-docs.pdf (PDF, 206.0 KB)

- **Title**: ares-docs
- **Created**: D:20260629012841+03'00'
- **Modified**: D:20260629012841+03'00'
- **Pages**: 18
- **Format**: PDF
- **Word Count**: 1758

- Words: 1758 | Chars: 11,826 | Pages: 18

### Content

ares-docs
Ares Car Rental Platform - Graduation Project Documentation

AL-AZHAR UNIVERSITY
Faculty of Engineering
Systems & Computers Department
تابساحلاومظنلاةسدنهمسق-هسدنهلاةيلك-رهزلأاةعماج
AProject Submitted in partial fulfilment of the requirements
for the Degree of Bachelor of Science
in Systems and Computers Engineering
Ares Car Rental Platform
2025
Submitted By
Supervised by
2024–2025

Examiner Committee
NameRoleSignature
President
Supervisor
Member

Table of contents
Preface7
1  CHAPTER 2: BACKGROUND MATERIALS8
1.1 2.1 Introduction . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .8
1.2 2.2 Technology Stack . . . . . . . . . . . . . . . . . . . . . . . . . . . . .8
1.2.1  2.2.1 Backend Technologies . . . . . . . . . . . . . . . . . . . .9
1.2.2  2.2.2 Frontend Technologies . . . . . . . . . . . . . . . . . . . .9
1.2.3  2.2.3 Infrastructure and Tooling . . . . . . . . . . . . . . . . . . .10
1.2.4  2.2.5Architectural Fit . . . . . . . . . . . . . . . . . . . . . . . .12
1.3 2.3 Domain Concepts . . . . . . . . . . . . . . . . . . . . . . . . . . . . .12
1.3.1  2.3.1 Fleet Management . . . . . . . . . . . . . . . . . . . . . . .13
1.3.2  2.3.2 Booking Workflow . . . . . . . . . . . . . . . . . . . . . .13
1.3.3  2.3.3 Payment Processing . . . . . . . . . . . . . . . . . . . . . .14
1.3.4  2.3.4 User Roles & Permissions . . . . . . . . . . . . . . . . . .14
1.3.5  2.3.5 Business Rules . . . . . . . . . . . . . . . . . . . . . . . .14
1.4 2.4 Related Work and Literature Review . . . . . . . . . . . . . . . . . . .15
1.4.1  2.4.1 Classical Car‑Rental Systems . . . . . . . . . . . . . . . . .15
1.4.2  2.4.2 Microservice‑OrientedApproaches . . . . . . . . . . . . . .15
1.4.3  2.4.3 Server‑Side Rendering vs. SPA . . . . . . . . . . . . . . . .15
1.4.4  2.4.4 Comparative Evaluation of ORMs . . . . . . . . . . . . . .16
1.4.5  2.4.5 Justification of the Chosen Stack . . . . . . . . . . . . . . .16
4

List of Figures
5

List of Tables
6

Preface
Ares Car Rental Platform— Graduation Project Documentation
A full-stack car rental platform built with .NET 10 and Next.js 16.
7

1 CHAPTER 2: BACKGROUND
MATERIALS
1.1 2.1 Introduction
This chapter supplies the technical and conceptual foundations required to comprehend the
design and implementation of the car‑rental management system presented in later chapters.
It begins with an overview of the technology stack (Section2.2), proceeds to a description
of the core domain concepts that drive the application (Section2.3), and concludes with a
concise literature review of related work (Section2.4). The material is deliberately limited
to the aspects that directly influence the solution architecture, thereby enabling the reader to
focus on the rationale behind the chosen tools and design decisions.
1.2 2.2 Technology Stack
The system is built as afull‑stack web applicationthat separates concerns between aback-
endAPIand afrontend user interfacewhile leveraging containerisation and continuous
integration to ensure reproducibility and rapid delivery.
8

1.2.1 2.2.1 Backend Technologies
Technology   Description    Reason for SelectionRole inArchitecture
.NET8A
cross‑platform,
high‑perfor-
mance
framework for
building
server‑side
applications.
Provides strong typing,
mature ecosystem, and
built‑in support for
dependency injection and
asynchronous
programming.
Hosts the RESTfulAPI
that implements business
logic, authentication, and
data access.
Entity
Framework
Core
(EFCore) 8
Object‑rela-
tional mapper
(ORM) for
.NET.
Enables code‑first
migrations, LINQ queries,
and reduces boiler‑plate
SQL.
Maps domain entities (e.g.,
Vehicle,Reservation)
to tables in SQLServer.
SQLServer
2022
Relational
database
management
system.
OffersACID compliance,
rich T‑SQLfeatures, and
seamless integration with
EFCore.
Persists all transactional
data such as bookings,
payments, and fleet
inventory.
ASP.NET
Core Web
API
Lightweight
framework for
building HTTP
services.
Supports
OpenAPI/Swagger
generation, versioning,
and built‑in middleware
pipeline.
Exposes endpoints
consumed by the frontend
and third‑party services
(e.g., payment gateway).
1.2.2 2.2.2 Frontend Technologies
9

Technology   Description    Reason for SelectionRole inArchitecture
Next.js 14React‑based
framework for
server‑side
rendering
(SSR) and
static site
generation
(SSG).
Improves SEO, initial load
performance, and provides
file‑system routing.
Hosts the user‑facing
portal (customer, admin,
and staff dashboards).
React18Declarative UI
library.
Large community,
component reuse, and
hooks for state
management.
Renders interactive
components such as
calendars, vehicle
selectors, and payment
forms.
TypeScript 5Superset of
JavaScript with
static typing.
Detects errors at compile
time, improves code
readability and
maintainability.
Enforces type safety
across the entire frontend
codebase.
Material UI
(MUI) v6
Component
library
implementing
Google’s
Material
Design.
Provides ready‑made,
accessible UI components
with theming support.
Supplies consistent visual
language for forms, tables,
dialogs, and navigation.
1.2.3 2.2.3 Infrastructure and Tooling
10

Tool    DescriptionReason for SelectionIntegration Point
Bun 1.0Fast JavaScript
runtime and
package manager.
Reduces install and build times
compared with npm/yarn.
Used for installing
frontend dependencies and
running build scripts.
Docker
26
Container
platform.
Guarantees environment parity
between development, testing,
and production.
Encapsulates the .NET
API, SQLServer, and
Nginx reverse proxy in
separate containers.
GitHub
Actions
CI/CD workflow
engine.
Native integration with
repository, supports matrix
builds and secret management.
Automates linting, unit
testing, Docker image
creation, and deployment
toAzureApp Service.
Azure
Kuber-
netes
Service
(AKS)
(op-
tional
for
scaling)
Managed
Kubernetes
offering.
Provides horizontal scaling
and rolling updates without
manual orchestration.
Hosts the Docker images
in a production‑grade
cluster.
1.2.3.1 2.2.4 Technology Adoption Timeline
%% Tech Stack Timeline
gantt
title Technology Adoption Timeline
11

Initial Setup : milestone, start, 2025-09-01, 1d
Frontend Setup : milestone, 2025-09-10, 1d
Backend Core : milestone, 2025-10-01, 1d
Testing Suite : milestone, 2025-11-01, 1d
Figure2.2: Technology adoption timeline showing major milestones.
1.2.4 2.2.5 Architectural Fit
The chosen stack follows aclean‑architectureapproach:
•Domain layer(pure C# classes) is independent of frameworks.
•Application layercontains use‑case services that orchestrate EFCore repositories.
•Infrastructure layerimplements concrete data access, external payment gateway
adapters, and Docker‑specific configuration.
•Presentation layer(Next.js) consumes the API via typed HTTP clients generated
from the OpenAPI specification, ensuring contract consistency.
1.3 2.3 Domain Concepts
The car‑rental system models a set of business processes that are common to most ve-
hicle‑sharing enterprises. Understanding these concepts is essential for interpreting the
subsequent design decisions.
12

1.3.1 2.3.1 Fleet Management
•Vehicle: Represents a physical automobile with attributes such as VIN, make, model,
class (economy, SUV, premium), mileage, and availability status.
•Location: Physical branch or parking lot where vehicles are stored; linked to GPS
coordinates for distance calculations.
•Maintenance Schedule: Periodic service records that affect vehicle availability (e.g.,
oil change, inspection).
1.3.2 2.3.2 Booking Workflow
1.Search & Selection– Customer provides pick‑up/drop‑off dates, location, and
vehicle class. The system returns a list of available vehicles with pricing.
2.Reservation Creation– Upon selection, aReservationentity is created in apending
state, reserving the vehicle for a configurable hold period (e.g., 15minutes).
3.Payment Authorization– Integration with a third‑party payment gateway (e.g.,
Stripe) authorises the customer’s payment method.  Successful authorization
transitions the reservation toconfirmed.
4.Confirmation & Notification– Confirmation email/SMS is dispatched; the
reservation is persisted, and the vehicle status changes toreserved.
5.Pick‑up & Return– Staff updates the reservation status toin‑useat pick‑up and to
completedupon return, triggering mileage and fuel‑level checks.
13

1.3.3 2.3.3 Payment Processing
•PaymentIntent(gateway concept) is created when the reservation is confirmed.
•Refund Handling– Supports full or partial refunds based on cancellation policy (e.g.,
24h before pick‑up).
•Invoice Generation– PDF invoices are generated using a server‑side templating
engine and stored for audit purposes.
1.3.4 2.3.4 User Roles & Permissions
RoleCapabilities
CustomerSearch vehicles, create/cancel reservations, view invoices,
manage profile.
StaffCheck‑in/out vehicles, record damages, update maintenance
logs, view daily reports.
AdministratorManage fleet data, configure pricing rules, oversee user
accounts, access analytics.
1.3.5 2.3.5 Business Rules
•Overlap Prevention– A vehicle cannot be double‑booked; the system enforces
temporal exclusivity using database constraints and application‑level checks.
•Dynamic Pricing– Prices may vary based on demand, season, and location; a pricing
engine calculates the final rate during the search step.
14

•Cancellation Policy– Penalties are applied automatically according to the time of
cancellation relative to the scheduled pick‑up.
1.4 2.4 Related Work and Literature Review
1.4.1 2.4.1 Classical Car�Rental Systems
Early academic prototypes (e.g.,R.M.Kumar, 2012) employed monolithic Java EE architec-
tures with JDBC for persistence. While functional, these solutions suffered from limited
scalability and tight coupling between UI and business logic.
1.4.2 2.4.2 Microservice�Oriented Approaches
Recent studies (e.g.,L.Chen etal., 2020) advocate decomposing the system into independent
services (fleet, reservation, payment). This yields better fault isolation but introduces
operational complexity (service discovery, distributed transactions).
1.4.3 2.4.3 Server�Side Rendering vs. SPA
Research comparing Next.js SSR with pure Single‑PageApplications (SPA) (e.g.,M.García,
2021) demonstrates that SSR improves first‑contentful paint and SEO for public booking
portals, whereas SPAexcels in highly interactive dashboards. The hybrid approach adopted
here leverages Next.js to obtain the best of both worlds.
15

1.4.4 2.4.4 Comparative Evaluation of ORMs
Benchmarks (e.g.,EFCore vs. Dapper–S.Patel, 2023) show that EFCore provides accept-
able performance for typical CRUD workloads while offering productivity gains through
LINQ and migrations. Consequently, EFCore was selected over micro‑ORMs.
1.4.5 2.4.5 Justification of the Chosen Stack
CriterionAlternativeChosen SolutionRationale
PerformanceNode.js + Express
(backend)
.NET8.NET’s JIT
compilation and
async I/O deliver
superior
throughput for
high‑concurrency
reservation
requests.
Developer
Productivity
Angular + RxJSNext.js + React +
TypeScript
React’s
component
model combined
with TypeScript
reduces
boilerplate and
accelerates UI
development.
16

CriterionAlternativeChosen SolutionRationale
Deployment
Simplicity
VM‑based
deployment
Docker + CI/CDContainerisation
abstracts OS
differences and
enables
reproducible
builds, aligning
with university’s
cloud‑lab
policies.
MaintainabilityHand‑crafted SQL   EFCoreCode‑first
migrations
simplify schema
evolution and
enforce
domain‑driven
design.
ScalabilitySingle‑instance server AKS (optional)Kubernetes
provides
horizontal scaling
without code
changes,
future‑proofing
the system.
Overall, the selected combination balancesperformance,maintainability, andease of
deployment, addressing the shortcomings identified in prior work while adhering to the
project’s time and resource constraints.
17

End of Chapter2.
18