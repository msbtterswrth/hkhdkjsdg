# Local Development

This project uses ddev for local development, which requires docker. Read the [DDEV docs](https://github.com/ddev/ddev/blob/master/README.md) before beginning. 

## Step 1 - Clone the project
Clone this project locally using
```bash
git clone git@github.com:Alt-Gov/website.git
```

> [!IMPORTANT]
> Make sure you have installed docker and DDEV before continuing.


## Step 2 - Install dependencies
Install dependencies by running the following command from your terminal.
```bash
ddev composer install
ddev drush cr
```

## Step 3 - Import the database
Import the database dump via DDEV and import config.
```bash
ddev import-db --file=[path-to-file]
ddev drush cim
ddev drush cr
```

## Step 4 - Build the frontend
Check that you are using at least the following minimum versions:

```bash
lstahl@lynn:~/$ npm -v
8.15.0
lstahl@lynn:~/$ node -v
v18.7.0
lstahl@lynn:~/$ gulp -v
CLI version: 2.3.0
Local version: 4.0.2
```

Install node dependencies in the theme directory.
```bash
cd /web/themes/custom/base
npm i
```

- After npm is installed you can build assets by running the following commands in the theme directory.
```bash
npx gulp
ddev drush cr
```
## Step 5 - Update settings file
Open the `/web/sites/default/settings.php` file and comment out lines 873-884. DO NOT COMMIT THIS. 

## Drush Commands
Drupal uses a script language called drush to execute commands. [Read their docs](https://www.drush.org/11.x/commands/user_login/) to learn about all the available commands, however the main commands we'll need to run for this project are:
- drush cr (cache rebuild)
- drush cim (config import)
- drush cex (config export)
- drush uli (user login)

## Branching
Please `git checkout prod && git pull` before you create a new feature branch using `git checkout -b feature/task-id-or-description`. Be sure to run `ddev composer install && drush cim` after pulling and merging prod into your branch to be sure you have imported all the latest changes. 

Merge your branch into `develop` to test your work before opening a PR into `prod` for deployment to production.
