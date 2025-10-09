# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Google Sign-In Configuration

Follow the steps below to keep the React app and ASP.NET Core API aligned when using Google sign-in:

1. Create or update a Google OAuth 2.0 Web application credential and copy the **Client ID** and **Client Secret**.
2. Set the React environment variable in `.env` (or `.env.development.local` during local work):
	- `REACT_APP_GOOGLE_CLIENT_ID=402182573159-gf1i4nu0f1qorshklgsdnem03rc6h07f.apps.googleusercontent.com`
	- Restart the frontend dev server after changing the file so Create React App picks up the new value. If the env var is missing, the app now falls back to the same default client ID and logs a warning in the console.
3. Provide the backend with the same Client ID and Secret. You can either edit `EVServiceCenter.API/appsettings.Development.json` for local work or, preferably, set environment variables:
	- `Authentication__Google__ClientId=402182573159-gf1i4nu0f1qorshklgsdnem03rc6h07f.apps.googleusercontent.com`
	- `Authentication__Google__ClientSecret=<your-google-client-secret>`
	- When using `dotnet user-secrets`, run it from the `EVServiceCenter.API` project directory.
4. In the Google Cloud Console credential, ensure:
	- **Authorized JavaScript origins** include `http://localhost:3000` (and any deployed domains).
	- **Authorized redirect URIs** cover any challenge-based flows you enable, such as `https://localhost:7077/signin-google`.
5. Restart the ASP.NET API so it reloads the updated configuration.

With matching credentials in place, the backend can validate Google ID tokens and the React client can request them without `invalid_client` errors.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
