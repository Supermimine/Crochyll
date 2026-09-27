# Crochyll
Website about crochet and others - Shop, pattern reader/maker and more

## Description
This project is a multi-site platform that currently includes an online store selling handmade crocheted items and clothing, as well as custom designs. It also features a universal crochet pattern reader to enhance and assist users. Finally, it includes a pattern designer to facilitate the creation and production of crochet patterns.

## Feature
**Shop**: An e-commerce store for crochet products, built using Vue 3 and Vuetify technology. Payments are processed via PayPal. The store offers various features, including promo codes, a shipping manager, advanced order customization, and product configuration options.

**Tool**: A suite of micro-tools designed to assist crocheters. Features include counters, stopwatches, terminology and hook size translators, a color palette generator, and a pixel art tool. These tools are arranged in a dynamic grid that users can customize to their preferences, with the system saving the position and content of each tool for long-term projects.

**My Profile**: A hub for managing and storing yarn and project inventories, featuring a simple, intuitive layout to help users effectively track their supplies.

**Maker**: A tool for creating and designing crochet patterns. It supports both 2D and 3D design, offering a fast, user-friendly interface to quickly bring your ideas to life visually.

**Reader**: A universal pattern reader that allows you to open patterns in any language and translate them into French or English. It provides clear, section-by-section term definitions to make the process as engaging as possible, while keeping a library of loaded patterns so you can track your progress over time.

## Authors
Main developer
* Supermimine

## Technologies
* **Frontend:** [HTML, CSS, TypeScript, VueJs, Vite, Vuetify]
* **Backend** [NodeJS, TypeScript]
* **Database:** [JSON file]
* **Payment:** [Paypal Package]
* **Email:** [Smtp]

## Version history
* 0.0.1 Initial push (shop and reader -> fondation)
* 0.0.2 Shop, tool, profil completed

## Installation and Launch
### Prerequisites
* Node.js (version 26+ recommandée)
* npm

### Installation
1. Clone the repository :
   ```bash
   git clone https://github.com/Supermimine/Crochyll.git
   ```
2. Go to the project folder :
   ```bash
   cd crochyll
   ```
3. Install the dependencies :
   ```bash
   npm install
   ```
4. Start the development server :
    (Backend)
   ```bash
   cd backend
   npm run dev
   ```
    (Frontend)
    ```bash
   cd frontend
   npm run dev
   ```


> [!NOTE]
> For any other information, please contact us at: info.crochyll@gmail.com

## License

This project is proprietary. **All rights reserved to Supermimine**. 

You may view the source code for educational or review purposes, but copying, modifying, redistributing, or commercializing this platform, its micro-tools, or any of its source code is strictly prohibited without explicit permission.
