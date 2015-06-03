'use strict';
var fs = require('fs');
var path = require('path');
var util = require('util');
var angularUtils = require('../util.js');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var wiredep = require('wiredep');
var chalk = require('chalk');

var Generator = module.exports = function Generator(args, options) {
  yeoman.generators.Base.apply(this, arguments);
  this.argument('appname', { type: String, required: false });
  this.appname = this.appname || path.basename(process.cwd());
  this.appname = this._.camelize(this._.slugify(this._.humanize(this.appname)));

  this.option('app-suffix', {
    desc: 'Allow a custom suffix to be added to the module name',
    type: String,
    required: 'false'
  });
  this.env.options['app-suffix'] = this.options['app-suffix'];
  this.scriptAppName = this.appname + angularUtils.appName(this);

  args = ['main'];

  if (typeof this.env.options.appPath === 'undefined') {
    this.option('appPath', {
      desc: 'Allow to choose where to write the files'
    });

    this.env.options.appPath = this.options.appPath;

    if (!this.env.options.appPath) {
      try {
        this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
      } catch (e) {}
    }
    this.env.options.appPath = this.env.options.appPath || './www';
    this.options.appPath = this.env.options.appPath;
  }

  this.appPath = this.env.options.appPath;

  // if (typeof this.env.options.coffee === 'undefined') {
  //   this.option('coffee', {
  //     desc: 'Generate CoffeeScript instead of JavaScript'
  //   });

  //   // attempt to detect if user is using CS or not
  //   // if cml arg provided, use that; else look for the existence of cs
  //   if (!this.options.coffee &&
  //     this.expandFiles(path.join(this.appPath, '/scripts/**/*.coffee'), {}).length > 0) {
  //     this.options.coffee = true;
  //   }

  //   this.env.options.coffee = this.options.coffee;
  // }

  // this.hookFor('angular:common', {
  //   args: args
  // });

  // this.hookFor('angular:main', {
  //   args: args
  // });

  // this.hookFor('angular:controller', {
  //   args: args
  // });

  this.on('end', function () {
    var enabledComponents = [];

    if (this.ngCordovaModule) {
      enabledComponents.push('ng-cordova/dist/ng-cordova.js');
    }

    if (this.ionicModule) {
      enabledComponents.push('ionic/js/ionic.bundle.js');
    }

    if (this.jqueryModule) {
      enabledComponents.push('jquery/dist/jquery.js');
    }

    if (this.wakandaModule) {
      enabledComponents.push('angular-wakanda/angular-wakanda.min.js');
    }

    enabledComponents = [
      //'angular/angular.js',
      //'angular-mocks/angular-mocks.js'
    ].concat(enabledComponents).join(',');

    // var jsExt = this.options.coffee ? 'coffee' : 'js';
    var jsExt = 'js';

    var bowerComments = [
      'bower:js',
      'endbower'
    ];
    // if (this.options.coffee) {
    //   bowerComments.push('bower:coffee');
    //   bowerComments.push('endbower');
    // }

    // this.invoke('karma:app', {
    //   options: {
    //     'skip-install': this.options['skip-install'],
    //     'base-path': '../',
    //     // 'coffee': this.options.coffee,
    //     'travis': true,
    //     'bower-components': enabledComponents,
    //     'files-comments': bowerComments.join(','),
    //     'app-files': 'app/scripts/**/*.' + jsExt,
    //     'test-files': [
    //       //'test/mock/**/*.' + jsExt,
    //       //'test/spec/**/*.' + jsExt
    //     ].join(','),
    //     'bower-components-path': 'bower_components'
    //   }
    // });

    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-message'],
      callback: this._injectDependencies.bind(this)
    });

    if (this.env.options.ngRoute) {
      this.invoke('angular:route', {
        args: ['about']
      });
    }

    //customize the main.html file @todo add the image
    // console.log(path.join(__dirname,'../templates','common/app/www/views/main.html'));
    // console.log(path.join(this.destinationRoot(),this.appPath,'www/views/main.html'));
    fs.writeFileSync(path.join(this.destinationRoot(),this.appPath,'views/main.html'),fs.readFileSync(path.join(__dirname,'../templates','common/app/www/views/main.html')));
    fs.writeFileSync(path.join(this.destinationRoot(),this.appPath,'images/wakanda.png'),fs.readFileSync(path.join(__dirname,'../templates','common/app/www/images/wakanda.png')));
    
  });

  this.pkg = require('../package.json');
  this.sourceRoot(path.join(__dirname, '../templates/common'));
};

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.welcome = function welcome() {
  if (!this.options['skip-welcome-message']) {
    this.log(yosay("Welcome to the Cordova/Wakanda yeoman Generator !"));
    this.log(
      chalk.magenta(
        'Out of the box I include Ionic Framework, ngCordova module, as well as the Wakanda/AngularJS connector.' +
        '\n'
      )
    );
  }

  if (this.options.minsafe) {
    this.log.error(
      'The --minsafe flag has been removed. For more information, see' +
      '\nhttps://github.com/yeoman/generator-angular#minification-safe.' +
      '\n'
    );
  }
};

Generator.prototype.askForAngularAppName = function askForAngularAppName() {
  var cb = this.async();

  this.prompt([{
    name: 'angularAppName',
    message: 'Name the app you want to generate (leave blank - "cordovaApp" by default)'
  }], function (props) {
    this.angularAppName = props.angularAppName === "" ? 'cordovaApp' : props.angularAppName;
    cb();
  }.bind(this));
};

Generator.prototype.askForCordovaAppName = function askForCordovaAppName() {
  var cb = this.async();

  this.prompt([{
    name: 'cordovaAppName',
    message: 'Name the id of the cordova app generated (leave blank - com.wakanda.cordova.'+this.angularAppName.toLowerCase()+'" by default)'
  }], function (props) {
    this.cordovaAppName = props.cordovaAppName === "" ? 'com.wakanda.cordova.'+this.angularAppName.toLowerCase() : props.cordovaAppName;
    
    cb();
  }.bind(this));
};

Generator.prototype.askForCompass = function askForCompass() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'compass',
    message: 'Would you like to use Sass (with Compass)?',
    default: true
  }], function (props) {
    this.compass = props.compass;

    cb();
  }.bind(this));
};

Generator.prototype.askForDummyData = function askForDummyData() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'dummydata',
    message: 'Would you like to populate your solution with some dummy data (WARNING: this will erase all your previous model data)?',
    default: false
  }], function (props) {
    this.dummydata = props.dummydata;
    cb();
  }.bind(this));
};

// Generator.prototype.askForBootstrap = function askForBootstrap() {
//   var compass = this.compass;
//   var cb = this.async();

//   this.prompt([{
//     type: 'confirm',
//     name: 'bootstrap',
//     message: 'Would you like to include Bootstrap?',
//     default: true
//   }, {
//     type: 'confirm',
//     name: 'compassBootstrap',
//     message: 'Would you like to use the Sass version of Bootstrap?',
//     default: true,
//     when: function (props) {
//       return props.bootstrap && compass;
//     }
//   }], function (props) {
//     this.bootstrap = props.bootstrap;
//     this.compassBootstrap = props.compassBootstrap;

//     cb();
//   }.bind(this));
// };

Generator.prototype.askForModules = function askForModules() {
  var cb = this.async();

  var prompts = [{
    type: 'checkbox',
    name: 'modules',
    message: 'Which modules would you like to include?',
    choices: [
      {
        value: 'wakandaModule',
        name: 'angular-wakanda.js',
        disabled: "Required",
        checked: true
      }, {
        value: 'ionic',
        name: 'ionic.js',
        disabled: "Required",
        checked: true
      }, {
        value: 'ngCordova',
        name: 'ng-cordova.js',
        checked: true
      }, {
        value: 'jquery',
        name: 'jquery.js',
        checked: false
      }
    ]
  }];

  this.prompt(prompts, function (props) {
    var hasMod = function (mod) { return props.modules.indexOf(mod) !== -1; };
    this.ngCordovaModule = hasMod('ngCordova');
    this.ionicModule = hasMod('ionic') || true;
    this.jqueryModule = hasMod('jquery');
    this.wakandaModule = hasMod('wakandaModule') || true;

    var angMods = [];

    if (this.ngCordovaModule) {
      angMods.push("'ngCordova'");
    }

    if (this.ionicModule) {
      angMods.push("'ionic'");
    }

    if (this.jqueryModule) {
      angMods.push("'jquery'");
    }

    if (this.wakandaModule) {
      angMods.push("'wakanda'");
    }

    if (angMods.length) {
      this.env.options.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n  ';
    }

    cb();
  }.bind(this));
};

Generator.prototype.createAngularAppFolder = function createAngularAppFolder() {
  this.mkdir(this.angularAppName);
};

Generator.prototype.createAngularAppSpecificFiles = function createAngularAppSpecificFiles() {
  var wakandaAppDefaultJson = this.read('root/_wakandaApp.default.json');
  this.write(this.angularAppName+'/wakandaApp.default.json',wakandaAppDefaultJson);
  this.write(this.angularAppName+'/wakandaApp.json',wakandaAppDefaultJson);
};

Generator.prototype.createWakandaPackageJson = function createWakandaPackageJson() {
  this.template('wakandaRoot/_package.json', 'package.json');
};

//creates a new .gitignore file or merges it with the existing one
Generator.prototype.createGitignore = function createGitignore() {
  var gitignoreOriginal,
          gitignoreBase,
          output,
          that = this;
  gitignoreBase = this.read('wakandaRoot/gitignore').split('\n').map(function(item){
    return item.replace('{angularAppName}',that.angularAppName);
  });
  try{
    output = this.readFileAsString(path.join(this.destinationRoot(),'.gitignore'));
  }
  catch(e){
    //no existing .gitignore file
    output = "";
  }
  gitignoreOriginal = output.split('\n');
  if(output !== ""){
    this.log('Wakanda project - .gitignore file exists - merging it');
  }
  else{
    this.log('Wakanda project - no existing .gitignore file - adding it');
  }
  gitignoreBase.forEach(function(item){
    if(gitignoreOriginal.indexOf(item) === -1){
      output += (output.length === 0 ? '' : '\n')+item;
    }
  });
  fs.writeFileSync(path.join(this.destinationRoot(),'.gitignore'),output);
};

//creates a new parsingExceptions.json file or merges it with the existing one (only needs the entry "node_modules")
Generator.prototype.createParsingExceptionsJson = function createParsingExceptionsJson(){
  var output;
  try{
    output = this.readFileAsString(path.join(this.destinationRoot(),'parsingExceptions.json'));
    try{
      output = JSON.parse(output);
    }
    catch(e){
      this.log('parsingExceptions.json is not valid, overwriting it.');
      output = {};
    }
  }
  catch(e){
    this.log('No parsingExceptions.json file, creating one.');
    output = {};
  }
  if(!output["excludedFolders"] || output["excludedFolders"] instanceof Array === false){
    this.log('"node_modules" missing in parsingExceptions.json file - adding it');
    output["excludedFolders"] = ["node_modules"];
  }
  else{
    if(output["excludedFolders"].indexOf('node_modules') === -1){
      this.log('"node_modules" missing in parsingExceptions.json file - adding it');
      output["excludedFolders"].push('node_modules');
    }
  }
  fs.writeFileSync(path.join(this.destinationRoot(),'parsingExceptions.json'),JSON.stringify(output,null,'  '));
};

Generator.prototype.createWakandaGruntfile = function createWakandaGruntfile() {
  this.template('wakandaRoot/_Gruntfile.js', 'Gruntfile.js');
};

Generator.prototype.installWakandaRootDependencies = function installWakandaRootDependencies() {
  this.log('Now npm install package.json dependencies in /');
  this.installDependencies({
    skipInstall: this.options['skip-install'],
    skipMessage: this.options['skip-message'],
    bower: false,
    npm: true,
    callback: this.afterInstallWakandaRootDependencies.bind(this)
  });
};

Generator.prototype.afterInstallWakandaRootDependencies = function afterInstallWakandaRootDependencies() {
  this.log('Now installing angular in /'+this.angularAppName+' folder');
};

Generator.prototype.switchProcessDirToAngularAppFolder = function switchProcessDirToAngularAppFolder() {
  process.chdir(this.angularAppName);
};

Generator.prototype.readIndex = function readIndex() {
  this.ngRoute = this.env.options.ngRoute;
  this.indexFile = this.engine(this.read('app/www/index.html'), this);
};

Generator.prototype.bootstrapFiles = function bootstrapFiles() {
  this.copy(
    path.join('app', 'hooks/README.md'),
    path.join(this.appPath, '../hooks/README.md')
  );

  this.copy(
    path.join('app', 'platforms/.gitkeep'),
    path.join(this.appPath, '../platforms/.gitkeep')
  );

  this.copy(
    path.join('app', 'plugins/.gitkeep'),
    path.join(this.appPath, '../plugins/.gitkeep')
  );

  this.copy(
    path.join('app', 'www/styles/main.' + (this.compass ? 's' : '') + 'css'),
    path.join(this.appPath, 'styles/main.' + (this.compass ? 's' : '') + 'css')
  );

  this.copy(
    path.join('app', 'www/robots.txt'),
    path.join(this.appPath, 'robots.txt')
  );

  this.copy(
    path.join('app', 'www/favicon.ico'),
    path.join(this.appPath, 'favicon.ico')
  );

  this.copy(
    path.join('app', 'www/views/main.html'),
    path.join(this.appPath, 'views/main.html')
  );

  this.copy(
    path.join('app', 'www/images/angular-wakanda.png'),
    path.join(this.appPath, 'images/angular-wakanda.png')
  );
  
  this.copy(
    path.join('app', 'www/images/cordova.png'),
    path.join(this.appPath, 'images/cordova.png')
  );
  
  this.copy(
    path.join('app', 'www/images/ionic.png'),
    path.join(this.appPath, 'images/ionic.png')
  );
  
  this.copy(
    path.join('app', 'www/images/wakanda.png'),
    path.join(this.appPath, 'images/wakanda.png')
  );
  
  this.copy(
    path.join('app', 'www/images/yeoman.png'),
    path.join(this.appPath, 'images/yeoman.png')
  );
  
  console.log("Populating Wakanda Data model...");
  
  if(this.dummydata){
    // copy model
     this.copy(
      path.join('wakandaRoot', 'DummyData/Model.js'),
      path.join(this.destinationRoot(),'../Model.js')
    );
    
     this.copy(
      path.join('wakandaRoot', 'DummyData/Model.waModel'),
      path.join(this.destinationRoot(),'../Model.waModel')
    );

     this.copy(
      path.join('wakandaRoot', 'DummyData/DataFolder/data.waData'),
      path.join(this.destinationRoot(),'../DataFolder/data.waData')
    );
     
     this.copy(
      path.join('wakandaRoot', 'DummyData/DataFolder/data.waIndx'),
      path.join(this.destinationRoot(),'../DataFolder/data.daIndx')
    );
     
     this.copy(
      path.join('wakandaRoot', 'DummyData/DataFolder/data.WakTDef'),
      path.join(this.destinationRoot(),'../DataFolder/data.WakTDef')
    );
  }
};

Generator.prototype.appJs = function appJs() {
  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/scripts.js',
    sourceFileList: ['scripts/app.js', 'scripts/controllers/main.js'],
    searchPath: ['.tmp', this.appPath]
  });
};

Generator.prototype.addJsFiles = function addJsFiles() {
  this.template(
    path.join('app', 'www/scripts/app.js'),
    path.join(this.appPath, 'scripts/app.js')
  );
  this.template(
    path.join('app', 'www/scripts/controllers/main.js'),
    path.join(this.appPath, 'scripts/controllers/main.js')
  );
};

Generator.prototype.createIndexHtml = function createIndexHtml() {
  this.indexFile = this.indexFile.replace(/&apos;/g, "'");
  this.write(path.join(this.appPath, 'index.html'), this.indexFile);
};

Generator.prototype.packageFiles = function packageFiles() {
  // this.coffee = this.env.options.coffee;
  this.template('root/_bower.json', 'bower.json');
  this.template('root/_package.json', 'package.json');
  this.template('root/_Gruntfile.js', 'Gruntfile.js');
  this.template('root/_config.xml', 'config.xml');
  this.template('root/README.md', 'README.md');
};

Generator.prototype._injectDependencies = function _injectDependencies() {
  if (this.options['skip-install']) {
    this.log(
      'After running `npm install`, inject your front end dependencies' +
      '\ninto your source code by running:' +
      '\n' +
      '\n' + chalk.yellow.bold('grunt wiredep')
    );
  } else {
    this.spawnCommand('grunt', ['wiredep']);
  }
};
