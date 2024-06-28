# Contributing to this Project

## Project Structure

A few Key Files and Folders to Consider:
- `next.config.js` configuration for Next.js
- `.env.template` clone and modify this to set environment variables
- `package.json` contains project metadata and dependencies
- `typedoc.json` configures TypeDoc to generate documenation from source code
- `tailwind.config.js` sets configuration options for Tailwind CSS framework
- `src/`
	- `pages/` folder and file structure under pages defines Next.js' routes
		- `_app.tsx` Custom App component to initialize pages
		- `_document.tsx` Custom Document component to augment the application's HTML and body tags
	- `components/` reusable React components, utilized by Pages
	- `config/defaults.ts` hard coded application defaults for user visits
