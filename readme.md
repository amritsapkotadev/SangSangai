# SangSangai — Safe Trekking, Side by Side 🏔️

**JunctionX Kathmandu Hackathon 2026**  
**Theme: Heritage & Culture | Team: TECDEVx**

---

## The Problem

Nepal draws hundreds of thousands of trekkers every year to its legendary Himalayan trails. Yet the trekking ecosystem remains fractured and risky for both sides. Foreign trekkers struggle to find reliable local guides, often relying on word of mouth or unverified online listings. Nepali guides, who carry generations of mountain knowledge, lack a digital platform to showcase their expertise and connect with incoming travelers. Emergency response is ad hoc — when a trekker goes missing, there is no structured alert system. And for cultural heritage routes that pass through ancient villages and sacred sites, there is no way to preserve and share the knowledge that local guides hold.

## What SangSangai Does

SangSangai is a mobile-first platform that bridges Nepali guides and foreign trekkers, making every Himalayan journey safer, more connected, and culturally richer. The name comes from the Nepali word for "togetherness" — the idea that trekking is safest and most fulfilling when done side by side.

### For Trekkers

The app begins with a curated onboarding experience that introduces the platform's values. Trekkers can browse available trips created by verified Nepali guides, filtering by destination, difficulty, duration, and budget. Each trip listing shows the guide's profile, rating, and verification status. Once a match is made, both parties can communicate and prepare for the journey.

During the trek, real-time location tracking lets the trekker share their progress with emergency contacts back home. The system monitors waypoint check-ins and automatically alerts designated contacts if a trekker fails to arrive at a scheduled point. A knowledge card feature lets guides share cultural and historical insights about the places they pass through — the story behind a mani wall, the significance of a village festival, the medicinal use of a Himalayan plant — turning every trek into a living cultural exchange.

### For Guides

Nepali guides can create detailed trip listings showcasing their routes, experience, and local knowledge. Verified guides earn trust badges that help them stand out. Upon successfully completing a trek, guides are rewarded with SangPoints, a blockchain-based loyalty token that recognizes their contribution to safe and culturally rich trekking. These points are minted on the Polygon blockchain and can be viewed in their profile.

### For Everyone

The community feature transforms SangSangai into more than a booking platform. Guides and trekkers alike can share stories, tips, and questions about treks, creating a living knowledge base of Himalayan travel. Users can like, save, and filter posts by category — stories, tips, questions, or emergencies — building a supportive community around the shared love of the mountains.

## The Cultural Context

Nepal's trekking routes are not just physical paths — they are corridors of living heritage. The Annapurna Circuit passes through Buddhist monasteries and Hindu pilgrimage sites. The Langtang Valley is home to Tamang communities with distinct traditions. The trails around Everest carry the history of Sherpa mountaineering culture. SangSangai treats this cultural fabric as integral to the trekking experience, not an afterthought. By enabling guides to document and share cultural knowledge, and by connecting travelers directly with local experts, the platform helps sustain the very heritage that makes Nepal's mountains unique.

## How It Works

A foreign trekker lands on the app and browses available treks posted by Nepali guides. They find a seven-day Annapurna Base Camp trek led by a verified guide from Pokhara. The match is made. The guide shares a knowledge card about the rhododendron forests and the cultural significance of the Annapurna sanctuary. The trekker's family back home receives a tracking link. Every waypoint check-in sends them reassurance. If the trekker goes overdue at Forest Camp, the system alerts the emergency contact. When both reach Mardi Base safely and the trek concludes, the guide receives SangPoints as a token of a job well done.

This is the vision: technology that does not replace human connection but strengthens it — making the Himalayas safer while honoring the cultural heritage that has drawn people to these mountains for generations.

## What We Built

Over the course of this hackathon, we built the complete end-to-end platform. The backend serves a comprehensive REST API handling authentication, user management, trip creation and matching, waypoint tracking, emergency alerting, file uploads and document verification, community posts with likes and saves, and blockchain-based SangPoints minting. The admin dashboard gives platform administrators full visibility into users, trips, matches, uploads, alerts, and token transactions. The mobile app, built with Expo and React Native, delivers a polished user experience across onboarding, authentication, browsing, matching, community interaction, and profile management — all integrated with the live backend.

The entire system runs on a single unified backend deployed on Vercel, with a Neon PostgreSQL database and Prisma for data access. The mobile app communicates with the backend over standard HTTP APIs, making the architecture clean and maintainable.

## The Team — TECDEVx

We are a team of developers and designers who believe technology can make adventure safer without making it less adventurous. SangSangai is our answer to the question of how Nepal's trekking heritage can thrive in a digital age — by putting the guide back at the center of the experience, by building safety into the journey itself, and by creating a community that celebrates the mountains and the people who call them home.
