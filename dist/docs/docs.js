(function () {
  angular.module('angularytics', []).provider('Angularytics', function () {
    var eventHandlersNames = ['Google'];
    this.setEventHandlers = function (handlers) {
      if (angular.isString(handlers)) {
        handlers = [handlers];
      }
      eventHandlersNames = [];
      angular.forEach(handlers, function (handler) {
        eventHandlersNames.push(capitalizeHandler(handler));
      });
    };
    var capitalizeHandler = function (handler) {
      return handler.charAt(0).toUpperCase() + handler.substring(1);
    };
    var pageChangeEvent = '$locationChangeSuccess';
    this.setPageChangeEvent = function (newPageChangeEvent) {
      pageChangeEvent = newPageChangeEvent;
    };
    this.$get = [
      '$injector',
      '$rootScope',
      '$location',
      function ($injector, $rootScope, $location) {
        var eventHandlers = [];
        angular.forEach(eventHandlersNames, function (handler) {
          eventHandlers.push($injector.get('Angularytics' + handler + 'Handler'));
        });
        var forEachHandlerDo = function (action) {
          angular.forEach(eventHandlers, function (handler) {
            action(handler);
          });
        };
        var service = {};
        service.init = function () {
        };
        service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
          forEachHandlerDo(function (handler) {
            if (category && action) {
              handler.trackEvent(category, action, opt_label, opt_value, opt_noninteraction);
            }
          });
        };
        service.trackPageView = function (url) {
          forEachHandlerDo(function (handler) {
            if (url) {
              handler.trackPageView(url);
            }
          });
        };
        service.trackTiming = function (category, variable, value, opt_label) {
          forEachHandlerDo(function (handler) {
            if (category && variable && value) {
              handler.trackTiming(category, variable, value, opt_label);
            }
          });
        };
        $rootScope.$on(pageChangeEvent, function () {
          service.trackPageView($location.url());
        });
        return service;
      }
    ];
  });
}());
(function () {
  angular.module('angularytics').factory('AngularyticsConsoleHandler', [
    '$log',
    function ($log) {
      var service = {};
      service.trackPageView = function (url) {
        $log.log('URL visited', url);
      };
      service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
        $log.log('Event tracked', category, action, opt_label, opt_value, opt_noninteraction);
      };
      service.trackTiming = function (category, variable, value, opt_label) {
        $log.log('Timing tracked', category, variable, value, opt_label);
      };
      return service;
    }
  ]);
}());
(function () {
  angular.module('angularytics').factory('AngularyticsGoogleHandler', function () {
    var service = {};
    service.trackPageView = function (url) {
      _gaq.push([
        '_set',
        'page',
        url
      ]);
      _gaq.push([
        '_trackPageview',
        url
      ]);
    };
    service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
      _gaq.push([
        '_trackEvent',
        category,
        action,
        opt_label,
        opt_value,
        opt_noninteraction
      ]);
    };
    service.trackTiming = function (category, variable, value, opt_label) {
      _gaq.push([
        '_trackTiming',
        category,
        variable,
        value,
        opt_label
      ]);
    };
    return service;
  }).factory('AngularyticsGoogleUniversalHandler', function () {
    var service = {};
    service.trackPageView = function (url) {
      ga('set', 'page', url);
      ga('send', 'pageview', url);
    };
    service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
      ga('send', 'event', category, action, opt_label, opt_value, { 'nonInteraction': opt_noninteraction });
    };
    service.trackTiming = function (category, variable, value, opt_label) {
      ga('send', 'timing', category, variable, value, opt_label);
    };
    return service;
  });
}());
(function () {
  angular.module('angularytics').filter('trackEvent', [
    'Angularytics',
    function (Angularytics) {
      return function (entry, category, action, opt_label, opt_value, opt_noninteraction) {
        Angularytics.trackEvent(category, action, opt_label, opt_value, opt_noninteraction);
        return entry;
      };
    }
  ]);
}());
angular.module('docsApp', ['angularytics', 'ngRoute', 'ngMessages', 'ngMaterial'], [
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$routeProvider',
  '$locationProvider',
  '$mdThemingProvider',
  '$mdIconProvider',
function(SERVICES, COMPONENTS, DEMOS, PAGES,
    $routeProvider, $locationProvider, $mdThemingProvider, $mdIconProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    })
    .when('/layout/:tmpl', {
      templateUrl: function(params){
        return 'partials/layout-' + params.tmpl + '.tmpl.html';
      }
    })
    .when('/layout/', {
      redirectTo:  '/layout/introduction'
    })
    .when('/demo/', {
      redirectTo: DEMOS[0].url
    })
    .when('/api/', {
      redirectTo: COMPONENTS[0].docs[0].url
    })
    .when('/getting-started', {
      templateUrl: 'partials/getting-started.tmpl.html'
    })
    .when('/contributors', {
      templateUrl: 'partials/contributors.tmpl.html'
    })
    .when('/license', {
      templateUrl: 'partials/license.tmpl.html'
    });
  $mdThemingProvider.definePalette('docs-blue', $mdThemingProvider.extendPalette('blue', {
    '50': '#DCEFFF',
    '100': '#AAD1F9',
    '200': '#7BB8F5',
    '300': '#4C9EF1',
    '400': '#1C85ED',
    '500': '#106CC8',
    '600': '#0159A2',
    '700': '#025EE9',
    '800': '#014AB6',
    '900': '#013583',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100',
    'contrastStrongLightColors': '300 400 A200 A400'
  }));
  $mdThemingProvider.definePalette('docs-red', $mdThemingProvider.extendPalette('red', {
    'A100': '#DE3641'
  }));

  $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('yellow')
    .dark();

  $mdThemingProvider.theme('site-toolbar')
    .primaryPalette('grey', {
      'default': '100'
    });

  $mdIconProvider.icon('md-toggle-arrow', 'img/icons/toggle-arrow.svg', 48);
  $mdIconProvider
    .iconSet('communication', 'img/icons/sets/communication-icons.svg', 24)
    .iconSet('device', 'img/icons/sets/device-icons.svg', 24)
    .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
    .iconSet('symbol', 'img/icons/sets/symbol-icons.svg', 24)
    .defaultIconSet('img/icons/sets/core-icons.svg', 24);

  $mdThemingProvider.theme('default')
      .primaryPalette('docs-blue')
      .accentPalette('docs-red');

  $mdThemingProvider.enableBrowserColor();

  angular.forEach(PAGES, function(pages, area) {
    angular.forEach(pages, function(page) {
      $routeProvider
        .when(page.url, {
          templateUrl: page.outputPath,
          controller: 'GuideCtrl'
        });
    });
  });

  angular.forEach(COMPONENTS, function(component) {
    angular.forEach(component.docs, function(doc) {
      $routeProvider.when('/' + doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
    });
  });

  angular.forEach(SERVICES, function(service) {
    $routeProvider.when('/' + service.url, {
      templateUrl: service.outputPath,
      resolve: {
        component: function() { return { isService: true } },
        doc: function() { return service; }
      },
      controller: 'ComponentDocCtrl'
    });
  });

  angular.forEach(DEMOS, function(componentDemos) {
    var demoComponent;

    COMPONENTS.forEach(function(component) {
      if (componentDemos.moduleName === component.name) {
        demoComponent = component;
        component.demoUrl = componentDemos.url;
      }
    });

    demoComponent = demoComponent || angular.extend({}, componentDemos);
    $routeProvider.when('/' + componentDemos.url, {
      templateUrl: 'partials/demo.tmpl.html',
      controller: 'DemoCtrl',
      resolve: {
        component: function() { return demoComponent; },
        demos: function() { return componentDemos.demos; }
      }
    });
  });

  $routeProvider.otherwise('/');

  // Change hash prefix of the AngularJS router, because we use the hash symbol for anchor links.
  // The hash will be not used by the docs, because we use the HTML5 mode for our links.
  $locationProvider.hashPrefix('!');

}])

.config(['$mdGestureProvider', 'AngularyticsProvider', function($mdGestureProvider, AngularyticsProvider) {
  $mdGestureProvider.skipClickHijack();
  AngularyticsProvider.setEventHandlers(['GoogleUniversal']);
}])

.run(['$rootScope', '$window', 'Angularytics', function($rootScope, $window, Angularytics) {
  Angularytics.init();
  $rootScope.$window = $window;
}])

.factory('menu', [
  'SERVICES',
  'COMPONENTS',
  'DEMOS',
  'PAGES',
  '$location',
  '$rootScope',
  '$http',
  '$window',
function(SERVICES, COMPONENTS, DEMOS, PAGES, $location, $rootScope, $http, $window) {

  var version = {};

  var sections = [{
    name: 'Getting Started',
    url: 'getting-started',
    type: 'link'
  }];

  var demoDocs = [];
  angular.forEach(DEMOS, function(componentDemos) {
    demoDocs.push({
      name: componentDemos.label,
      url: componentDemos.url
    });
  });

  sections.push({
    name: 'Demos',
    pages: demoDocs.sort(sortByName),
    type: 'toggle'
  });

  sections.push();

  sections.push({
    name: 'Customization',
    type: 'heading',
    children: [
      {
        name: 'CSS',
        type: 'toggle',
        pages: [{
            name: 'Typography',
            url: 'CSS/typography',
            type: 'link'
          },
          {
            name : 'Button',
            url: 'CSS/button',
            type: 'link'
          },
          {
            name : 'Checkbox',
            url: 'CSS/checkbox',
            type: 'link'
          }]
      },
      {
        name: 'Theming',
        type: 'toggle',
        pages: [
          {
            name: 'Introduction and Terms',
            url: 'Theming/01_introduction',
            type: 'link'
          },
          {
            name: 'Declarative Syntax',
            url: 'Theming/02_declarative_syntax',
            type: 'link'
          },
          {
            name: 'Configuring a Theme',
            url: 'Theming/03_configuring_a_theme',
            type: 'link'
          },
          {
            name: 'Multiple Themes',
            url: 'Theming/04_multiple_themes',
            type: 'link'
          },
          {
            name: 'Under the Hood',
            url: 'Theming/05_under_the_hood',
            type: 'link'
          },
          {
            name: 'Browser Color',
            url: 'Theming/06_browser_color',
            type: 'link'
          }
        ]
      },
      {
        name: 'Performance',
        type: 'toggle',
        pages: [{
            name: 'Internet Explorer',
            url: 'performance/internet-explorer',
            type: 'link'
          }]
      }
    ]
  });

  var docsByModule = {};
  var apiDocs = {};
  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      if (angular.isDefined(doc.private)) return;
      apiDocs[doc.type] = apiDocs[doc.type] || [];
      apiDocs[doc.type].push(doc);

      docsByModule[doc.module] = docsByModule[doc.module] || [];
      docsByModule[doc.module].push(doc);
    });
  });

  SERVICES.forEach(function(service) {
    if (angular.isDefined(service.private)) return;
    apiDocs[service.type] = apiDocs[service.type] || [];
    apiDocs[service.type].push(service);

    docsByModule[service.module] = docsByModule[service.module] || [];
    docsByModule[service.module].push(service);
  });

  sections.push({
    name: 'API Reference',
    type: 'heading',
    children: [
    {
      name: 'Layout',
      type: 'toggle',
      pages: [{
        name: 'Introduction',
        id: 'layoutIntro',
        url: 'layout/introduction'
      },
      {
        name: 'Layout Containers',
        id: 'layoutContainers',
        url: 'layout/container'
      },
      {
        name: 'Layout Children',
        id: 'layoutGrid',
        url: 'layout/children'
      },
      {
        name: 'Child Alignment',
        id: 'layoutAlign',
        url: 'layout/alignment'
      },
      {
        name: 'Extra Options',
        id: 'layoutOptions',
        url: 'layout/options'
      },
      {
        name: 'Troubleshooting',
        id: 'layoutTips',
        url: 'layout/tips'
      }]
    },
    {
      name: 'Services',
      pages: apiDocs.service.sort(sortByName),
      type: 'toggle'
    },{
      name: 'Types',
      pages: apiDocs.type.sort(sortByName),
      type: 'toggle'
    },{
      name: 'Directives',
      pages: apiDocs.directive.sort(sortByName),
      type: 'toggle'
    }]
  });

  sections.push({
    name: 'Migration to Angular',
    url: 'migration',
    type: 'link'
  });

  sections.push({
    name: 'Contributors',
    url: 'contributors',
    type: 'link'
  });

  sections.push({
    name: 'License',
    url:  'license',
    type: 'link',

    // Add a hidden section so that the title in the toolbar is properly set
    hidden: true
  });

  function sortByName(a,b) {
    return a.name < b.name ? -1 : 1;
  }

  var self;

  $rootScope.$on('$locationChangeSuccess', onLocationChange);

  $http.get("/docs.json")
      .then(function(response) {
        response = response.data;
        var versionId = getVersionIdFromPath();
        var head = { type: 'version', url: '/HEAD', id: 'head', name: 'HEAD (master)', github: '' };
        var commonVersions = versionId === 'head' ? [] : [head];
        var knownVersions = getAllVersions();
        var listVersions = knownVersions.filter(removeCurrentVersion);
        var currentVersion = getCurrentVersion() || {name: 'local'};
        version.current = currentVersion;
        sections.unshift({
          name: 'Documentation Version',
          type: 'heading',
          className: 'version-picker',
          children: [{
            name: currentVersion.name,
            type: 'toggle',
            pages: commonVersions.concat(listVersions)
          }]
        });
        function removeCurrentVersion (version) {
          switch (versionId) {
            case version.id: return false;
            case 'latest': return !version.latest;
            default: return true;
          }
        }
        function getAllVersions () {
          if (response && response.versions && response.versions.length) {
            return response.versions.map(function(version) {
              var latest = response.latest === version;
              return {
                type: 'version',
                url: '/' + version,
                name: getVersionFullString({ id: version, latest: latest }),
                id: version,
                latest: latest,
                github: 'tree/v' + version
              };
            });
          }

          return [];
        }
        function getVersionFullString (version) {
          return version.latest
              ? 'Latest Release (' + version.id + ')'
              : 'Release ' + version.id;
        }
        function getCurrentVersion () {
          switch (versionId) {
            case 'head': return head;
            case 'latest': return knownVersions.filter(getLatest)[0];
            default: return knownVersions.filter(getVersion)[0];
          }
          function getLatest (version) { return version.latest; }
          function getVersion (version) { return versionId === version.id; }
        }
        function getVersionIdFromPath () {
          var path = $window.location.pathname;
          if (path.length < 2) path = 'HEAD';
          return path.match(/[^/]+/)[0].toLowerCase();
        }
      });

  return self = {
    version:  version,
    sections: sections,

    selectSection: function(section) {
      self.openedSection = section;
    },
    toggleSelectSection: function(section) {
      self.openedSection = (self.openedSection === section ? null : section);
    },
    isSectionSelected: function(section) {
      return self.openedSection === section;
    },

    selectPage: function(section, page) {
      self.currentSection = section;
      self.currentPage = page;
    },
    isPageSelected: function(page) {
      return self.currentPage === page;
    }
  };

  function onLocationChange() {
    var path = $location.path();
    var introLink = {
      name: "Introduction",
      url:  "/",
      type: "link"
    };

    if (path === '/') {
      self.selectSection(introLink);
      self.selectPage(introLink, introLink);
      return;
    }

    var matchPage = function(section, page) {
      if (path.indexOf(page.url) !== -1) {
        self.selectSection(section);
        self.selectPage(section, page);
      }
    };

    sections.forEach(function(section) {
      if (section.children) {
        // matches nested section toggles, such as API or Customization
        section.children.forEach(function(childSection){
          if (childSection.pages){
            childSection.pages.forEach(function(page){
              matchPage(childSection, page);
            });
          }
        });
      }
      else if (section.pages) {
        // matches top-level section toggles, such as Demos
        section.pages.forEach(function(page) {
          matchPage(section, page);
        });
      }
      else if (section.type === 'link') {
        // matches top-level links, such as "Getting Started"
        matchPage(section, section);
      }
    });
  }
}])

.directive('menuLink', ['scrollCache', function(scrollCache) {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-link.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isSelected = function() {
        return controller.isSelected($scope.section);
      };

      $scope.focusSection = function() {
        // set flag to be used later when
        // $locationChangeSuccess calls openPage()
        controller.autoFocusContent = true;
        // set flag to be used later when $routeChangeStart saves scroll position
        scrollCache.linkClicked = true;
      };
    }
  };
}])

.directive('menuToggle', ['$mdUtil', '$animateCss', '$$rAF', function($mdUtil, $animateCss, $$rAF) {
  return {
    scope: {
      section: '='
    },
    templateUrl: 'partials/menu-toggle.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      // Used for toggling the visibility of the accordion's content, after
      // all of the animations are completed. This prevents users from being
      // allowed to tab through to the hidden content.
      $scope.renderContent = false;

      $scope.isOpen = function() {
        return controller.isOpen($scope.section);
      };

      $scope.toggle = function() {
        controller.toggleOpen($scope.section);
      };

      $mdUtil.nextTick(function() {
        $scope.$watch(function () {
          return controller.isOpen($scope.section);
        }, function (open) {
          var $ul = $element.find('ul');
          var $li = $ul[0].querySelector('a.active');

          if (open) {
            $scope.renderContent = true;
          }

          $$rAF(function() {
            var targetHeight = open ? $ul[0].scrollHeight : 0;

            $animateCss($ul, {
              easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
              to: { height: targetHeight + 'px' },
              duration: 0.75 // seconds
            }).start().then(function() {
              var $li = $ul[0].querySelector('a.active');

              $scope.renderContent = open;

              if (open && $li && $ul[0].scrollTop === 0) {
                var activeHeight = $li.scrollHeight;
                var activeOffset = $li.offsetTop;
                var offsetParent = $li.offsetParent;
                var parentScrollPosition = offsetParent ? offsetParent.offsetTop : 0;

                // Reduce it a bit (2 list items' height worth) so it doesn't touch the nav
                var negativeOffset = activeHeight * 2;
                var newScrollTop = activeOffset + parentScrollPosition - negativeOffset;

                $mdUtil.animateScrollTo(document.querySelector('.docs-menu').parentNode, newScrollTop);
              }
            });
          });
        });
      });

      var parentNode = $element[0].parentNode.parentNode.parentNode;
      if (parentNode.classList.contains('parent-list-item')) {
        var heading = parentNode.querySelector('h2');
        $element[0].firstChild.setAttribute('aria-describedby', heading.id);
      }
    }
  };
}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  'BUILDCONFIG',
  '$mdSidenav',
  '$timeout',
  '$mdDialog',
  'menu',
  '$location',
  '$rootScope',
  '$mdUtil',
function($scope, COMPONENTS, BUILDCONFIG, $mdSidenav, $timeout, $mdDialog, menu, $location, $rootScope, $mdUtil) {
  var self = this;

  $scope.COMPONENTS = COMPONENTS;
  $scope.BUILDCONFIG = BUILDCONFIG;
  $scope.menu = menu;

  $scope.path = path;
  $scope.goHome = goHome;
  $scope.openMenu = openMenu;
  $scope.closeMenu = closeMenu;
  $scope.isSectionSelected = isSectionSelected;
  $scope.scrollTop = scrollTop;

  // Grab the current year so we don't have to update the license every year
  $scope.thisYear = (new Date()).getFullYear();

  $rootScope.$on('$locationChangeSuccess', openPage);
  $scope.focusMainContent = focusMainContent;

  // Define a fake model for the related page selector
  Object.defineProperty($rootScope, "relatedPage", {
    get: function () { return null; },
    set: angular.noop,
    enumerable: true,
    configurable: true
  });

  $rootScope.redirectToUrl = function(url) {
    $location.path(url);
    $timeout(function () { $rootScope.relatedPage = null; }, 100);
  };

  // Methods used by menuLink and menuToggle directives
  this.isOpen = isOpen;
  this.isSelected = isSelected;
  this.toggleOpen = toggleOpen;
  this.autoFocusContent = false;


  var mainContentArea = document.querySelector("main");
  var mainContentHeader = mainContentArea.querySelector(".md-breadcrumb");
  var scrollContentEl = mainContentArea.querySelector('md-content[md-scroll-y]');


  // *********************
  // Internal methods
  // *********************

  function closeMenu() {
    $timeout(function() { $mdSidenav('left').close(); });
  }

  function openMenu() {
    $timeout(function() { $mdSidenav('left').open(); });
  }

  function path() {
    return $location.path();
  }

  function scrollTop() {
    $mdUtil.animateScrollTo(scrollContentEl, 0, 200);
  }

  function goHome($event) {
    menu.selectPage(null, null);
    $location.path('/');
  }

  function openPage() {
    $scope.closeMenu();

    if (self.autoFocusContent) {
      focusMainContent();
      self.autoFocusContent = false;
    }
  }

  function focusMainContent($event) {
    $scope.closeMenu();
    // prevent skip link from redirecting
    if ($event) { $event.preventDefault(); }

    $timeout(function(){
      mainContentHeader.focus();
    }, 90);

  }

  function isSelected(page) {
    return menu.isPageSelected(page);
  }

  function isSectionSelected(section) {
    var selected = false;
    var openedSection = menu.openedSection;
    if (openedSection === section){
      selected = true;
    }
    else if (section.children) {
      section.children.forEach(function(childSection) {
        if (childSection === openedSection){
          selected = true;
        }
      });
    }
    return selected;
  }

  function isOpen(section) {
    return menu.isSectionSelected(section);
  }

  function toggleOpen(section) {
    menu.toggleSelectSection(section);
  }
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
function($scope, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
}])


.controller('GuideCtrl', [
  '$rootScope', '$http',
function($rootScope, $http) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
  if (!$rootScope.contributors) {
    $http
      .get('./contributors.json')
      .then(function(response) {
        $rootScope.github = response.data;
      })
  }
}])

.controller('LayoutCtrl', [
  '$scope',
  '$attrs',
  '$location',
  '$rootScope',
function($scope, $attrs, $location, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;

  $scope.exampleNotEditable = true;
  $scope.layoutDemo = {
    mainAxis: 'center',
    crossAxis: 'center',
    direction: 'row'
  };
  $scope.layoutAlign = function() {
    return $scope.layoutDemo.mainAxis +
     ($scope.layoutDemo.crossAxis ? ' ' + $scope.layoutDemo.crossAxis : '')
  };
}])

.controller('LayoutTipsCtrl', [
function() {
  var self = this;

  /*
   * Flex Sizing - Odd
   */
  self.toggleButtonText = "Hide";

  self.toggleContentSize = function() {
    var contentEl = angular.element(document.getElementById('toHide'));

    contentEl.toggleClass("ng-hide");

    self.toggleButtonText = contentEl.hasClass("ng-hide") ? "Show" : "Hide";
  };
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
function($scope, doc, component, $rootScope) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = doc;
}])

.controller('DemoCtrl', [
  '$rootScope',
  '$scope',
  'component',
  'demos',
  '$templateRequest',
function($rootScope, $scope, component, demos, $templateRequest) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = null;

  $scope.demos = [];

  angular.forEach(demos, function(demo) {
    // Get displayed contents (un-minified)
    var files = [demo.index]
      .concat(demo.js || [])
      .concat(demo.css || [])
      .concat(demo.html || []);
    files.forEach(function(file) {
      file.httpPromise = $templateRequest(file.outputPath)
        .then(function(response) {
          file.contents = response
            .replace('<head/>', '');
          return file.contents;
        });
    });
    demo.$files = files;
    $scope.demos.push(demo);
  });

  $scope.demos = $scope.demos.sort(function(a,b) {
    return a.name > b.name ? 1 : -1;
  });

}])

.filter('nospace', function () {
  return function (value) {
    return (!value) ? '' : value.replace(/ /g, '');
  };
})
.filter('humanizeDoc', function() {
  return function(doc) {
    if (!doc) return;
    if (doc.type === 'directive') {
      return doc.name.replace(/([A-Z])/g, function($1) {
        return '-'+$1.toLowerCase();
      });
    }
    return doc.label || doc.name;
  };
})

.filter('directiveBrackets', function() {
  return function(str, restrict) {
    if (restrict) {
      // If it is restricted to only attributes
      if (!restrict.element && restrict.attribute) {
        return '[' + str + ']';
      }

      // If it is restricted to elements and isn't a service
      if (restrict.element && str.indexOf('-') > -1) {
        return '<' + str + '>';
      }

      // TODO: Handle class/comment restrictions if we ever have any to document
    }

    // Just return the original string if we don't know what to do with it
    return str;
  };
})

/** Directive which applies a specified class to the element when being scrolled */
.directive('docsScrollClass', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {

      var scrollParent = element.parent();
      var isScrolling = false;

      // Initial update of the state.
      updateState();

      // Register a scroll listener, which updates the state.
      scrollParent.on('scroll', updateState);

      function updateState() {
        var newState = scrollParent[0].scrollTop !== 0;

        if (newState !== isScrolling) {
          element.toggleClass(attr.docsScrollClass, newState);
        }

        isScrolling = newState;
      }
    }
  };
})

.factory('scrollCache', function() {
  var cache = {};
  var linkClicked = false;

  function setScroll(key, scrollPostion) {
    cache[key] = scrollPostion;
  }

  function getScroll(key) {
    return cache[key] || 0;
  }

  return {
    getScroll: getScroll,
    setScroll: setScroll,
    linkClicked: linkClicked
  };
})

/**
 * This directive caches the scroll position for each route + templateUrl combination.
 * This helps in restoring the scroll when the user uses back or forward navigation to return
 * to a page.
 */
.directive('cacheScrollPosition', ['$route', '$mdUtil', '$timeout', '$location', '$anchorScroll',
  'scrollCache',
function($route, $mdUtil, $timeout, $location, $anchorScroll, scrollCache) {
  var mainContentArea = document.querySelector("main");
  var scrollContentEl = mainContentArea.querySelector('md-content[md-scroll-y]');

  /**
   * @param {Object} event Synthetic event object
   * @param {Object} next Future route information
   * @param {Object} current Current route information
   */
  var handleRouteChangeStart = function (event, next, current) {
    // store scroll position for the current path + template
    if ($route.current) {
      scrollCache.setScroll(current.loadedTemplateUrl + ":" + current.$$route.originalPath,
        scrollContentEl.scrollTop);
    }

    // set scroll to 0 for next route, if explicitly clicked on link.
    if (scrollCache.linkClicked) {
      scrollCache.setScroll(next.$$route.templateUrl + ":" + next.$$route.originalPath, 0);
      scrollCache.linkClicked = false;
    }
  };

  /**
   * @param {Object} event Synthetic event object
   * @param {Object} current Current route information
   */
  var handleRouteChangeSuccess = function (event, current) {
    // if hash is specified explicitly, it trumps previously stored scroll position
    if ($location.hash()) {
      $anchorScroll();
    } else {
      // Get previous scroll position; if none, scroll to the top of the page
      var prevScrollPos = scrollCache.getScroll(current.loadedTemplateUrl + ":" +
        current.$$route.originalPath);

      $timeout(function() {
        $mdUtil.animateScrollTo(scrollContentEl, prevScrollPos);
      }, 0);
    }
  };

  return function(scope) {
    scope.$on('$routeChangeStart', handleRouteChangeStart);
    scope.$on('$routeChangeSuccess', handleRouteChangeSuccess);
  }
}]);

(function() {
  angular
    .module('docsApp')
    .directive('h4', MdAnchorDirective)
    .directive('h3', MdAnchorDirective)
    .directive('h2', MdAnchorDirective)
    .directive('h1', MdAnchorDirective);

  function MdAnchorDirective($mdUtil, $compile, $rootScope) {

    /** @const @type {RegExp} */
    var unsafeCharRegex = /[&\s+$,:;=?@"#{}|^~[`%!'\]./()*\\]/g;

    return {
      restrict: 'E',
      scope: {},
      require: '^?mdContent',
      link: postLink
    };

    function postLink(scope, element, attr, ctrl) {

      // Only create anchors when being inside of a md-content.
      // Don't create anchors for menu headers as they have no associated content.
      if (!ctrl || element[0].classList && element[0].classList.contains('menu-heading')) {
        return;
      }

      var anchorEl = $compile('<a class="docs-anchor" ng-href="{{ href }}" name="{{ name }}"></a>')(scope);

      // Wrap contents inside of the anchor element.
      anchorEl.append(element.contents());

      // Append the anchor element to the directive element.
      element.append(anchorEl);

      // Delay the URL creation, because the inner text might be not interpolated yet.
      $mdUtil.nextTick(createContentURL);

      /**
       * Creates URL from the text content of the element and writes it into the scope.
       */
      function createContentURL() {
        var path = '';
        var name = element.text();
        // Use $window.location.pathname to get the path with the baseURL included.
        // $location.path() does not include the baseURL. This is important to support how the docs
        // are deployed with baseURLs like /latest, /HEAD, /1.1.13, etc.
        if (scope.$root.$window && scope.$root.$window.location) {
          path = scope.$root.$window.location.pathname;
        }
        name = name
          .trim()                           // Trim text due to browsers extra whitespace.
          .replace(/'/g, '')                // Transform apostrophes words to a single one.
          .replace(unsafeCharRegex, '-')    // Replace unsafe chars with a dash symbol.
          .replace(/-{2,}/g, '-')           // Remove repeating dash symbols.
          .replace(/^-|-$/g, '')            // Remove preceding or ending dashes.
          .toLowerCase();                   // Link should be lower-case for accessible URL.
        scope.name = name;
        scope.href = path + '#' + name;
      }
    }
  }

  // Manually specify $inject because Strict DI is enabled.
  MdAnchorDirective.$inject = ['$mdUtil', '$compile'];

})();

angular.module('docsApp').constant('BUILDCONFIG', {
  "ngVersion": "1.7.8",
  "version": "1.1.20",
  "repository": "https://github.com/angular/material",
  "commit": "199a8d86852307b6ebf010d7f3bab24cd82e46c2",
  "date": "2019-11-06 10:52:44 +0100"
});

(function() {
  angular.module('docsApp')
    .factory('codepenDataAdapter', CodepenDataAdapter)
    .factory('codepen', ['$demoAngularScripts', '$document', 'codepenDataAdapter', Codepen]);

  // Provides a service to open a code example in codepen.
  function Codepen($demoAngularScripts, $document, codepenDataAdapter) {

    // The following URL used to be HTTP and not HTTPS to allow us to do localhost testing
    // It's no longer working, for more info:
    // https://blog.codepen.io/2017/03/31/codepen-going-https/
    var CODEPEN_API = 'https://codepen.io/pen/define/';

    return {
      editOnCodepen: editOnCodepen
    };

    // Creates a codepen from the given demo model by posting to Codepen's API
    // using a hidden form.  The hidden form is necessary to avoid a CORS issue.
    // See http://blog.codepen.io/documentation/api/prefill
    function editOnCodepen(demo) {
      var externalScripts = $demoAngularScripts.all();
      externalScripts.push('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.1/moment.js');
      var data = codepenDataAdapter.translate(demo, externalScripts);
      var form = buildForm(data);
      $document.find('body').append(form);
      form[0].submit();
      form.remove();
    }

    // Builds a hidden form with data necessary to create a codepen.
    function buildForm(data) {
      var form = angular.element(
        '<form style="display: none;" method="post" target="_blank" action="' +
          CODEPEN_API +
          '"></form>'
      );
      var input = '<input type="hidden" name="data" value="' + escapeJsonQuotes(data) + '" />';
      form.append(input);
      return form;
    }

    // Recommended by Codepen to escape quotes.
    // See http://blog.codepen.io/documentation/api/prefill
    function escapeJsonQuotes(json) {
      return JSON.stringify(json)
        .replace(/'/g, "&amp;apos;")
        .replace(/"/g, "&amp;quot;")
        /**
         * Codepen was unescaping &lt; (<) and &gt; (>) which caused, on some demos,
         * an unclosed elements (like <md-select>).
         * Used different unicode lookalike characters so it won't be considered as an element
         */
        .replace(/&amp;lt;/g, "&#x02C2;") // http://graphemica.com/%CB%82
        .replace(/&amp;gt;/g, "&#x02C3;"); // http://graphemica.com/%CB%83
    }
  }

  // Translates demo metadata and files into Codepen's post form data.  See api documentation for
  // additional fields not used by this service. http://blog.codepen.io/documentation/api/prefill
  function CodepenDataAdapter() {

    // The following URL's need to use `localhost` as these values get replaced during release
    var CORE_JS  = 'http://localhost:8080/angular-material.js';
    var CORE_CSS = 'http://localhost:8080/angular-material.css';
    var DOC_CSS  = 'http://localhost:8080/docs.css';              // CSS overrides for custom docs

    var LINK_FONTS_ROBOTO = '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">';

    var UNSECURE_CACHE_JS = 'http://ngmaterial.assets.s3.amazonaws.com/svg-assets-cache.js';
    var ASSET_CACHE_JS = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-114/svg-assets-cache.js';


    return {
      translate: translate
    };

    // Translates a demo model to match Codepen's post data
    // See http://blog.codepen.io/documentation/api/prefill
    function translate(demo, externalScripts) {
      var files = demo.files;

      return appendLicenses({
        title: demo.title,
        html: processHtml(demo),
        head: LINK_FONTS_ROBOTO,

        js: processJs(files.js),
        css: mergeFiles(files.css).join(' '),

        js_external: externalScripts.concat([ASSET_CACHE_JS, CORE_JS]).join(';'),
        css_external: [CORE_CSS, DOC_CSS].join(';')
      });
    }

    // Modifies index.html with necessary changes in order to display correctly in codepen
    // See each processor to determine how each modifies the html
    function processHtml(demo) {

      var allContent = demo.files.index.contents;

      var processors = [
        applyAngularAttributesToParentElement,
        insertTemplatesAsScriptTags,
        htmlEscapeAmpersand
      ];

      processors.forEach(function(processor) {
        allContent = processor(allContent, demo);
      });

      return allContent;
    }

    /**
     * Append MIT License information to all CodePen source samples(HTML, JS, CSS)
     */
    function appendLicenses(data) {

      data.html = appendLicenseFor(data.html, 'html');
      data.js   = appendLicenseFor(data.js, 'js');
      data.css  = appendLicenseFor(data.css, 'css');

      function appendLicenseFor(content, lang) {
            var commentStart = '', commentEnd = '';

        switch (lang) {
          case 'html' : commentStart = '<!--'; commentEnd = '-->'; break;
          case 'js'   : commentStart = '/**';  commentEnd = '**/'; break;
          case 'css'  : commentStart = '/*';   commentEnd = '*/';  break;
        }

        return content + '\n\n'+
          commentStart + '\n'+
          'Copyright 2018 Google LLC. All Rights Reserved. \n'+
          'Use of this source code is governed by an MIT-style license that can be found\n'+
          'in the LICENSE file at http://material.angularjs.org/HEAD/license.\n'+
          commentEnd;
      }

      return data;
    }


    // Applies modifications the javascript prior to sending to codepen.
    // Currently merges js files and replaces the module with the Codepen
    // module.  See documentation for replaceDemoModuleWithCodepenModule.
    function processJs(jsFiles) {
      var mergedJs = mergeFiles(jsFiles).join(' ');
      var script = replaceDemoModuleWithCodepenModule(mergedJs);
      return script;
    }

    // Maps file contents to an array
    function mergeFiles(files) {
      return files.map(function(file) {
        return file.contents;
      });
    }

    // Adds class to parent element so that styles are applied correctly
    // Adds ng-app attribute.  This is the same module name provided in the asset-cache.js
    function applyAngularAttributesToParentElement(html, demo) {
      var tmp;

      // Grab only the DIV for the demo...
      angular.forEach(angular.element(html), function(it,key){
        if ((it.nodeName != "SCRIPT") && (it.nodeName != "#text")) {
          tmp = angular.element(it);
        }
      });

      tmp.addClass(demo.id);
      tmp.attr('ng-app', 'MyApp');
      return tmp[0].outerHTML;
    }

    // Adds templates inline in the html, so that templates are cached in the example
    function insertTemplatesAsScriptTags(indexHtml, demo) {
      if (demo.files.html.length) {
        var tmp = angular.element(indexHtml);
        angular.forEach(demo.files.html, function(template) {
          tmp.append("<script type='text/ng-template' id='" +
                     template.name + "'>" +
                     template.contents +
                     "</script>");
        });
        return tmp[0].outerHTML;
      }
      return indexHtml;
    }

    // Escapes ampersands so that after codepen unescapes the html the escaped code block
    // uses the correct escaped characters
    function htmlEscapeAmpersand(html) {
      return html
        .replace(/&/g, "&amp;");
    }

    // Required to make codePen work. Demos define their own module when running on the
    // docs site.  In order to ensure the codepen example can use the svg-asset-cache.js, the
    // module needs to match so that the $templateCache is populated with the necessary
    // assets.

    function replaceDemoModuleWithCodepenModule(file) {
      var matchAngularModule =  /\.module\(('[^']*'|"[^"]*")\s*,(\s*\[([^\]]*)\]\s*\))/ig;
      var modules = "['ngMaterial', 'ngMessages', 'material.svgAssetsCache']";

      // See scripts.js for list of external AngularJS libraries used for the demos

      return file.replace(matchAngularModule, ".module('MyApp', "+ modules + ")");
    }
  }
})();

angular.module('docsApp').constant('COMPONENTS', [
  {
    "name": "material.components.autocomplete",
    "type": "module",
    "outputPath": "partials/api/material.components.autocomplete/index.html",
    "url": "api/material.components.autocomplete",
    "label": "material.components.autocomplete",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/autocomplete.js",
    "docs": [
      {
        "name": "mdAutocomplete",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.autocomplete/directive/mdAutocomplete.html",
        "url": "api/directive/mdAutocomplete",
        "label": "mdAutocomplete",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/js/autocompleteDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdHighlightText",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.autocomplete/directive/mdHighlightText.html",
        "url": "api/directive/mdHighlightText",
        "label": "mdHighlightText",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/autocomplete/js/highlightDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.bottomSheet",
    "type": "module",
    "outputPath": "partials/api/material.components.bottomSheet/index.html",
    "url": "api/material.components.bottomSheet",
    "label": "material.components.bottomSheet",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/bottomSheet/bottom-sheet.js",
    "docs": [
      {
        "name": "$mdBottomSheet",
        "type": "service",
        "outputPath": "partials/api/material.components.bottomSheet/service/$mdBottomSheet.html",
        "url": "api/service/$mdBottomSheet",
        "label": "$mdBottomSheet",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/bottomSheet/bottom-sheet.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.button",
    "type": "module",
    "outputPath": "partials/api/material.components.button/index.html",
    "url": "api/material.components.button",
    "label": "material.components.button",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/button/button.js",
    "docs": [
      {
        "name": "mdButton",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.button/directive/mdButton.html",
        "url": "api/directive/mdButton",
        "label": "mdButton",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/button/button.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.card",
    "type": "module",
    "outputPath": "partials/api/material.components.card/index.html",
    "url": "api/material.components.card",
    "label": "material.components.card",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/card/card.js",
    "docs": [
      {
        "name": "mdCard",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.card/directive/mdCard.html",
        "url": "api/directive/mdCard",
        "label": "mdCard",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/card/card.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.checkbox",
    "type": "module",
    "outputPath": "partials/api/material.components.checkbox/index.html",
    "url": "api/material.components.checkbox",
    "label": "material.components.checkbox",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/checkbox/checkbox.js",
    "docs": [
      {
        "name": "mdCheckbox",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.checkbox/directive/mdCheckbox.html",
        "url": "api/directive/mdCheckbox",
        "label": "mdCheckbox",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/checkbox/checkbox.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.chips",
    "type": "module",
    "outputPath": "partials/api/material.components.chips/index.html",
    "url": "api/material.components.chips",
    "label": "material.components.chips",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/chips.js",
    "docs": [
      {
        "name": "mdChip",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdChip.html",
        "url": "api/directive/mdChip",
        "label": "mdChip",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/chipDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdChipRemove",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdChipRemove.html",
        "url": "api/directive/mdChipRemove",
        "label": "mdChipRemove",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/chipRemoveDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdChips",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdChips.html",
        "url": "api/directive/mdChips",
        "label": "mdChips",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/chipsDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdContactChips",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.chips/directive/mdContactChips.html",
        "url": "api/directive/mdContactChips",
        "label": "mdContactChips",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/chips/js/contactChipsDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.colors",
    "type": "module",
    "outputPath": "partials/api/material.components.colors/index.html",
    "url": "api/material.components.colors",
    "label": "material.components.colors",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/colors/colors.js",
    "docs": [
      {
        "name": "$mdColors",
        "type": "service",
        "outputPath": "partials/api/material.components.colors/service/$mdColors.html",
        "url": "api/service/$mdColors",
        "label": "$mdColors",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/colors/colors.js",
        "hasDemo": false
      },
      {
        "name": "mdColors",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.colors/directive/mdColors.html",
        "url": "api/directive/mdColors",
        "label": "mdColors",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/colors/colors.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.content",
    "type": "module",
    "outputPath": "partials/api/material.components.content/index.html",
    "url": "api/material.components.content",
    "label": "material.components.content",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/content/content.js",
    "docs": [
      {
        "name": "mdContent",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.content/directive/mdContent.html",
        "url": "api/directive/mdContent",
        "label": "mdContent",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/content/content.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.datepicker",
    "type": "module",
    "outputPath": "partials/api/material.components.datepicker/index.html",
    "url": "api/material.components.datepicker",
    "label": "material.components.datepicker",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/datePicker.js",
    "docs": [
      {
        "name": "mdCalendar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.datepicker/directive/mdCalendar.html",
        "url": "api/directive/mdCalendar",
        "label": "mdCalendar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/js/calendar.js",
        "hasDemo": true
      },
      {
        "name": "$mdDateLocaleProvider",
        "type": "service",
        "outputPath": "partials/api/material.components.datepicker/service/$mdDateLocaleProvider.html",
        "url": "api/service/$mdDateLocaleProvider",
        "label": "$mdDateLocaleProvider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/js/dateLocaleProvider.js",
        "hasDemo": false
      },
      {
        "name": "mdDatepicker",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.datepicker/directive/mdDatepicker.html",
        "url": "api/directive/mdDatepicker",
        "label": "mdDatepicker",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/datepicker/js/datepickerDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.dialog",
    "type": "module",
    "outputPath": "partials/api/material.components.dialog/index.html",
    "url": "api/material.components.dialog",
    "label": "material.components.dialog",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/dialog/dialog.js",
    "docs": [
      {
        "name": "mdDialog",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.dialog/directive/mdDialog.html",
        "url": "api/directive/mdDialog",
        "label": "mdDialog",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/dialog/dialog.js",
        "hasDemo": true
      },
      {
        "name": "$mdDialog",
        "type": "service",
        "outputPath": "partials/api/material.components.dialog/service/$mdDialog.html",
        "url": "api/service/$mdDialog",
        "label": "$mdDialog",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/dialog/dialog.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.divider",
    "type": "module",
    "outputPath": "partials/api/material.components.divider/index.html",
    "url": "api/material.components.divider",
    "label": "material.components.divider",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/divider/divider.js",
    "docs": [
      {
        "name": "mdDivider",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.divider/directive/mdDivider.html",
        "url": "api/directive/mdDivider",
        "label": "mdDivider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/divider/divider.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.fabActions",
    "type": "module",
    "outputPath": "partials/api/material.components.fabActions/index.html",
    "url": "api/material.components.fabActions",
    "label": "material.components.fabActions",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabActions/fabActions.js",
    "docs": [
      {
        "name": "mdFabActions",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.fabActions/directive/mdFabActions.html",
        "url": "api/directive/mdFabActions",
        "label": "mdFabActions",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabActions/fabActions.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.fabSpeedDial",
    "type": "module",
    "outputPath": "partials/api/material.components.fabSpeedDial/index.html",
    "url": "api/material.components.fabSpeedDial",
    "label": "material.components.fabSpeedDial",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabSpeedDial/fabSpeedDial.js",
    "docs": [
      {
        "name": "mdFabSpeedDial",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.fabSpeedDial/directive/mdFabSpeedDial.html",
        "url": "api/directive/mdFabSpeedDial",
        "label": "mdFabSpeedDial",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabSpeedDial/fabSpeedDial.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.fabToolbar",
    "type": "module",
    "outputPath": "partials/api/material.components.fabToolbar/index.html",
    "url": "api/material.components.fabToolbar",
    "label": "material.components.fabToolbar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabToolbar/fabToolbar.js",
    "docs": [
      {
        "name": "mdFabToolbar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.fabToolbar/directive/mdFabToolbar.html",
        "url": "api/directive/mdFabToolbar",
        "label": "mdFabToolbar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/fabToolbar/fabToolbar.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.gridList",
    "type": "module",
    "outputPath": "partials/api/material.components.gridList/index.html",
    "url": "api/material.components.gridList",
    "label": "material.components.gridList",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/grid-list.js",
    "docs": [
      {
        "name": "mdGridList",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.gridList/directive/mdGridList.html",
        "url": "api/directive/mdGridList",
        "label": "mdGridList",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/grid-list.js",
        "hasDemo": true
      },
      {
        "name": "mdGridTile",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.gridList/directive/mdGridTile.html",
        "url": "api/directive/mdGridTile",
        "label": "mdGridTile",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/gridList/grid-list.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.icon",
    "type": "module",
    "outputPath": "partials/api/material.components.icon/index.html",
    "url": "api/material.components.icon",
    "label": "material.components.icon",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/icon.js",
    "docs": [
      {
        "name": "mdIcon",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.icon/directive/mdIcon.html",
        "url": "api/directive/mdIcon",
        "label": "mdIcon",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/js/iconDirective.js",
        "hasDemo": true
      },
      {
        "name": "$mdIconProvider",
        "type": "service",
        "outputPath": "partials/api/material.components.icon/service/$mdIconProvider.html",
        "url": "api/service/$mdIconProvider",
        "label": "$mdIconProvider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/js/iconService.js",
        "hasDemo": false
      },
      {
        "name": "$mdIcon",
        "type": "service",
        "outputPath": "partials/api/material.components.icon/service/$mdIcon.html",
        "url": "api/service/$mdIcon",
        "label": "$mdIcon",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/icon/js/iconService.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.input",
    "type": "module",
    "outputPath": "partials/api/material.components.input/index.html",
    "url": "api/material.components.input",
    "label": "material.components.input",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
    "docs": [
      {
        "name": "mdInputContainer",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.input/directive/mdInputContainer.html",
        "url": "api/directive/mdInputContainer",
        "label": "mdInputContainer",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
        "hasDemo": true
      },
      {
        "name": "mdInput",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.input/directive/mdInput.html",
        "url": "api/directive/mdInput",
        "label": "mdInput",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
        "hasDemo": true
      },
      {
        "name": "mdSelectOnFocus",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.input/directive/mdSelectOnFocus.html",
        "url": "api/directive/mdSelectOnFocus",
        "label": "mdSelectOnFocus",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/input/input.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.list",
    "type": "module",
    "outputPath": "partials/api/material.components.list/index.html",
    "url": "api/material.components.list",
    "label": "material.components.list",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js",
    "docs": [
      {
        "name": "mdList",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.list/directive/mdList.html",
        "url": "api/directive/mdList",
        "label": "mdList",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js",
        "hasDemo": true
      },
      {
        "name": "mdListItem",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.list/directive/mdListItem.html",
        "url": "api/directive/mdListItem",
        "label": "mdListItem",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/list/list.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.menu",
    "type": "module",
    "outputPath": "partials/api/material.components.menu/index.html",
    "url": "api/material.components.menu",
    "label": "material.components.menu",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/menu/menu.js",
    "docs": [
      {
        "name": "mdMenu",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.menu/directive/mdMenu.html",
        "url": "api/directive/mdMenu",
        "label": "mdMenu",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/menu/js/menuDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.menuBar",
    "type": "module",
    "outputPath": "partials/api/material.components.menuBar/index.html",
    "url": "api/material.components.menuBar",
    "label": "material.components.menuBar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/menuBar/menu-bar.js",
    "docs": [
      {
        "name": "mdMenuBar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.menuBar/directive/mdMenuBar.html",
        "url": "api/directive/mdMenuBar",
        "label": "mdMenuBar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/menuBar/js/menuBarDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.navBar",
    "type": "module",
    "outputPath": "partials/api/material.components.navBar/index.html",
    "url": "api/material.components.navBar",
    "label": "material.components.navBar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/navBar/navBar.js",
    "docs": [
      {
        "name": "mdNavBar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.navBar/directive/mdNavBar.html",
        "url": "api/directive/mdNavBar",
        "label": "mdNavBar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/navBar/navBar.js",
        "hasDemo": true
      },
      {
        "name": "mdNavItem",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.navBar/directive/mdNavItem.html",
        "url": "api/directive/mdNavItem",
        "label": "mdNavItem",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/navBar/navBar.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.panel",
    "type": "module",
    "outputPath": "partials/api/material.components.panel/index.html",
    "url": "api/material.components.panel",
    "label": "material.components.panel",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
    "docs": [
      {
        "name": "$mdPanelProvider",
        "type": "service",
        "outputPath": "partials/api/material.components.panel/service/$mdPanelProvider.html",
        "url": "api/service/$mdPanelProvider",
        "label": "$mdPanelProvider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "$mdPanel",
        "type": "service",
        "outputPath": "partials/api/material.components.panel/service/$mdPanel.html",
        "url": "api/service/$mdPanel",
        "label": "$mdPanel",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "MdPanelRef",
        "type": "type",
        "outputPath": "partials/api/material.components.panel/type/MdPanelRef.html",
        "url": "api/type/MdPanelRef",
        "label": "MdPanelRef",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "MdPanelPosition",
        "type": "type",
        "outputPath": "partials/api/material.components.panel/type/MdPanelPosition.html",
        "url": "api/type/MdPanelPosition",
        "label": "MdPanelPosition",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      },
      {
        "name": "MdPanelAnimation",
        "type": "type",
        "outputPath": "partials/api/material.components.panel/type/MdPanelAnimation.html",
        "url": "api/type/MdPanelAnimation",
        "label": "MdPanelAnimation",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/panel/panel.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.progressCircular",
    "type": "module",
    "outputPath": "partials/api/material.components.progressCircular/index.html",
    "url": "api/material.components.progressCircular",
    "label": "material.components.progressCircular",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressCircular/progress-circular.js",
    "docs": [
      {
        "name": "mdProgressCircular",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.progressCircular/directive/mdProgressCircular.html",
        "url": "api/directive/mdProgressCircular",
        "label": "mdProgressCircular",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressCircular/js/progressCircularDirective.js",
        "hasDemo": true
      },
      {
        "name": "$mdProgressCircular",
        "type": "service",
        "outputPath": "partials/api/material.components.progressCircular/service/$mdProgressCircular.html",
        "url": "api/service/$mdProgressCircular",
        "label": "$mdProgressCircular",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressCircular/js/progressCircularProvider.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.progressLinear",
    "type": "module",
    "outputPath": "partials/api/material.components.progressLinear/index.html",
    "url": "api/material.components.progressLinear",
    "label": "material.components.progressLinear",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressLinear/progress-linear.js",
    "docs": [
      {
        "name": "mdProgressLinear",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.progressLinear/directive/mdProgressLinear.html",
        "url": "api/directive/mdProgressLinear",
        "label": "mdProgressLinear",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/progressLinear/progress-linear.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.radioButton",
    "type": "module",
    "outputPath": "partials/api/material.components.radioButton/index.html",
    "url": "api/material.components.radioButton",
    "label": "material.components.radioButton",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radio-button.js",
    "docs": [
      {
        "name": "mdRadioGroup",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.radioButton/directive/mdRadioGroup.html",
        "url": "api/directive/mdRadioGroup",
        "label": "mdRadioGroup",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radio-button.js",
        "hasDemo": true
      },
      {
        "name": "mdRadioButton",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.radioButton/directive/mdRadioButton.html",
        "url": "api/directive/mdRadioButton",
        "label": "mdRadioButton",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/radioButton/radio-button.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.select",
    "type": "module",
    "outputPath": "partials/api/material.components.select/index.html",
    "url": "api/material.components.select",
    "label": "material.components.select",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/select/select.js",
    "docs": [
      {
        "name": "mdSelect",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.select/directive/mdSelect.html",
        "url": "api/directive/mdSelect",
        "label": "mdSelect",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/select/select.js",
        "hasDemo": true
      },
      {
        "name": "mdOption",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.select/directive/mdOption.html",
        "url": "api/directive/mdOption",
        "label": "mdOption",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/select/select.js",
        "hasDemo": true
      },
      {
        "name": "mdOptgroup",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.select/directive/mdOptgroup.html",
        "url": "api/directive/mdOptgroup",
        "label": "mdOptgroup",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/select/select.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.sidenav",
    "type": "module",
    "outputPath": "partials/api/material.components.sidenav/index.html",
    "url": "api/material.components.sidenav",
    "label": "material.components.sidenav",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
    "docs": [
      {
        "name": "$mdSidenav",
        "type": "service",
        "outputPath": "partials/api/material.components.sidenav/service/$mdSidenav.html",
        "url": "api/service/$mdSidenav",
        "label": "$mdSidenav",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
        "hasDemo": false
      },
      {
        "name": "mdSidenavFocus",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.sidenav/directive/mdSidenavFocus.html",
        "url": "api/directive/mdSidenavFocus",
        "label": "mdSidenavFocus",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
        "hasDemo": true
      },
      {
        "name": "mdSidenav",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.sidenav/directive/mdSidenav.html",
        "url": "api/directive/mdSidenav",
        "label": "mdSidenav",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sidenav/sidenav.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.slider",
    "type": "module",
    "outputPath": "partials/api/material.components.slider/index.html",
    "url": "api/material.components.slider",
    "label": "material.components.slider",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/slider/slider.js",
    "docs": [
      {
        "name": "mdSliderContainer",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.slider/directive/mdSliderContainer.html",
        "url": "api/directive/mdSliderContainer",
        "label": "mdSliderContainer",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/slider/slider.js",
        "hasDemo": true
      },
      {
        "name": "mdSlider",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.slider/directive/mdSlider.html",
        "url": "api/directive/mdSlider",
        "label": "mdSlider",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/slider/slider.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.sticky",
    "type": "module",
    "outputPath": "partials/api/material.components.sticky/index.html",
    "url": "api/material.components.sticky",
    "label": "material.components.sticky",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/sticky/sticky.js",
    "docs": [
      {
        "name": "$mdSticky",
        "type": "service",
        "outputPath": "partials/api/material.components.sticky/service/$mdSticky.html",
        "url": "api/service/$mdSticky",
        "label": "$mdSticky",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/sticky/sticky.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.subheader",
    "type": "module",
    "outputPath": "partials/api/material.components.subheader/index.html",
    "url": "api/material.components.subheader",
    "label": "material.components.subheader",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/subheader/subheader.js",
    "docs": [
      {
        "name": "mdSubheader",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.subheader/directive/mdSubheader.html",
        "url": "api/directive/mdSubheader",
        "label": "mdSubheader",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/subheader/subheader.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.swipe",
    "type": "module",
    "outputPath": "partials/api/material.components.swipe/index.html",
    "url": "api/material.components.swipe",
    "label": "material.components.swipe",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
    "docs": [
      {
        "name": "mdSwipeLeft",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeLeft.html",
        "url": "api/directive/mdSwipeLeft",
        "label": "mdSwipeLeft",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      },
      {
        "name": "mdSwipeRight",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeRight.html",
        "url": "api/directive/mdSwipeRight",
        "label": "mdSwipeRight",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      },
      {
        "name": "mdSwipeUp",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeUp.html",
        "url": "api/directive/mdSwipeUp",
        "label": "mdSwipeUp",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      },
      {
        "name": "mdSwipeDown",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.swipe/directive/mdSwipeDown.html",
        "url": "api/directive/mdSwipeDown",
        "label": "mdSwipeDown",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/swipe/swipe.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.switch",
    "type": "module",
    "outputPath": "partials/api/material.components.switch/index.html",
    "url": "api/material.components.switch",
    "label": "material.components.switch",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/switch/switch.js",
    "docs": [
      {
        "name": "mdSwitch",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": true
        },
        "outputPath": "partials/api/material.components.switch/directive/mdSwitch.html",
        "url": "api/directive/mdSwitch",
        "label": "mdSwitch",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/switch/switch.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.tabs",
    "type": "module",
    "outputPath": "partials/api/material.components.tabs/index.html",
    "url": "api/material.components.tabs",
    "label": "material.components.tabs",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/tabs.js",
    "docs": [
      {
        "name": "mdTab",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.tabs/directive/mdTab.html",
        "url": "api/directive/mdTab",
        "label": "mdTab",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/js/tabDirective.js",
        "hasDemo": true
      },
      {
        "name": "mdTabs",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.tabs/directive/mdTabs.html",
        "url": "api/directive/mdTabs",
        "label": "mdTabs",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tabs/js/tabsDirective.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.toast",
    "type": "module",
    "outputPath": "partials/api/material.components.toast/index.html",
    "url": "api/material.components.toast",
    "label": "material.components.toast",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/toast/toast.js",
    "docs": [
      {
        "name": "$mdToast",
        "type": "service",
        "outputPath": "partials/api/material.components.toast/service/$mdToast.html",
        "url": "api/service/$mdToast",
        "label": "$mdToast",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/toast/toast.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.toolbar",
    "type": "module",
    "outputPath": "partials/api/material.components.toolbar/index.html",
    "url": "api/material.components.toolbar",
    "label": "material.components.toolbar",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/toolbar/toolbar.js",
    "docs": [
      {
        "name": "mdToolbar",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.toolbar/directive/mdToolbar.html",
        "url": "api/directive/mdToolbar",
        "label": "mdToolbar",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/toolbar/toolbar.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.tooltip",
    "type": "module",
    "outputPath": "partials/api/material.components.tooltip/index.html",
    "url": "api/material.components.tooltip",
    "label": "material.components.tooltip",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/tooltip/tooltip.js",
    "docs": [
      {
        "name": "mdTooltip",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.tooltip/directive/mdTooltip.html",
        "url": "api/directive/mdTooltip",
        "label": "mdTooltip",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/tooltip/tooltip.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.truncate",
    "type": "module",
    "outputPath": "partials/api/material.components.truncate/index.html",
    "url": "api/material.components.truncate",
    "label": "material.components.truncate",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/truncate/truncate.js",
    "docs": [
      {
        "name": "mdTruncate",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.truncate/directive/mdTruncate.html",
        "url": "api/directive/mdTruncate",
        "label": "mdTruncate",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/truncate/truncate.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.virtualRepeat",
    "type": "module",
    "outputPath": "partials/api/material.components.virtualRepeat/index.html",
    "url": "api/material.components.virtualRepeat",
    "label": "material.components.virtualRepeat",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/virtualRepeat/virtual-repeater.js",
    "docs": [
      {
        "name": "mdVirtualRepeatContainer",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.virtualRepeat/directive/mdVirtualRepeatContainer.html",
        "url": "api/directive/mdVirtualRepeatContainer",
        "label": "mdVirtualRepeatContainer",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/virtualRepeat/virtual-repeater.js",
        "hasDemo": true
      },
      {
        "name": "mdVirtualRepeat",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.virtualRepeat/directive/mdVirtualRepeat.html",
        "url": "api/directive/mdVirtualRepeat",
        "label": "mdVirtualRepeat",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/virtualRepeat/virtual-repeater.js",
        "hasDemo": true
      },
      {
        "name": "mdForceHeight",
        "type": "directive",
        "restrict": {
          "element": false,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.virtualRepeat/directive/mdForceHeight.html",
        "url": "api/directive/mdForceHeight",
        "label": "mdForceHeight",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/virtualRepeat/virtual-repeater.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.components.whiteframe",
    "type": "module",
    "outputPath": "partials/api/material.components.whiteframe/index.html",
    "url": "api/material.components.whiteframe",
    "label": "material.components.whiteframe",
    "module": "material.components",
    "githubUrl": "https://github.com/angular/material/blob/master/src/components/whiteframe/whiteframe.js",
    "docs": [
      {
        "name": "mdWhiteframe",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.components.whiteframe/directive/mdWhiteframe.html",
        "url": "api/directive/mdWhiteframe",
        "label": "mdWhiteframe",
        "module": "material.components",
        "githubUrl": "https://github.com/angular/material/blob/master/src/components/whiteframe/whiteframe.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.aria",
    "type": "module",
    "outputPath": "partials/api/material.core.aria/index.html",
    "url": "api/material.core.aria",
    "label": "material.core.aria",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/aria/aria.js",
    "docs": [
      {
        "name": "$mdAriaProvider",
        "type": "service",
        "outputPath": "partials/api/material.core.aria/service/$mdAriaProvider.html",
        "url": "api/service/$mdAriaProvider",
        "label": "$mdAriaProvider",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/aria/aria.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.compiler",
    "type": "module",
    "outputPath": "partials/api/material.core.compiler/index.html",
    "url": "api/material.core.compiler",
    "label": "material.core.compiler",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/compiler/compiler.js",
    "docs": [
      {
        "name": "$mdCompilerProvider",
        "type": "service",
        "outputPath": "partials/api/material.core.compiler/service/$mdCompilerProvider.html",
        "url": "api/service/$mdCompilerProvider",
        "label": "$mdCompilerProvider",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/compiler/compiler.js",
        "hasDemo": false
      },
      {
        "name": "$mdCompiler",
        "type": "service",
        "outputPath": "partials/api/material.core.compiler/service/$mdCompiler.html",
        "url": "api/service/$mdCompiler",
        "label": "$mdCompiler",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/compiler/compiler.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.gestures",
    "type": "module",
    "outputPath": "partials/api/material.core.gestures/index.html",
    "url": "api/material.core.gestures",
    "label": "material.core.gestures",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/gesture/gesture.js",
    "docs": [
      {
        "name": "$mdGestureProvider",
        "type": "service",
        "outputPath": "partials/api/material.core.gestures/service/$mdGestureProvider.html",
        "url": "api/service/$mdGestureProvider",
        "label": "$mdGestureProvider",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/gesture/gesture.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.interaction",
    "type": "module",
    "outputPath": "partials/api/material.core.interaction/index.html",
    "url": "api/material.core.interaction",
    "label": "material.core.interaction",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/interaction/interaction.js",
    "docs": [
      {
        "name": "$mdInteraction",
        "type": "service",
        "outputPath": "partials/api/material.core.interaction/service/$mdInteraction.html",
        "url": "api/service/$mdInteraction",
        "label": "$mdInteraction",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/interaction/interaction.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.liveannouncer",
    "type": "module",
    "outputPath": "partials/api/material.core.liveannouncer/index.html",
    "url": "api/material.core.liveannouncer",
    "label": "material.core.liveannouncer",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/liveAnnouncer/live-announcer.js",
    "docs": [
      {
        "name": "$mdLiveAnnouncer",
        "type": "service",
        "outputPath": "partials/api/material.core.liveannouncer/service/$mdLiveAnnouncer.html",
        "url": "api/service/$mdLiveAnnouncer",
        "label": "$mdLiveAnnouncer",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/liveAnnouncer/live-announcer.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.ripple",
    "type": "module",
    "outputPath": "partials/api/material.core.ripple/index.html",
    "url": "api/material.core.ripple",
    "label": "material.core.ripple",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/ripple/ripple.js",
    "docs": [
      {
        "name": "mdInkRipple",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.core.ripple/directive/mdInkRipple.html",
        "url": "api/directive/mdInkRipple",
        "label": "mdInkRipple",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/ripple/ripple.js",
        "hasDemo": true
      },
      {
        "name": "$mdInkRipple",
        "type": "service",
        "outputPath": "partials/api/material.core.ripple/service/$mdInkRipple.html",
        "url": "api/service/$mdInkRipple",
        "label": "$mdInkRipple",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/ripple/ripple.js",
        "hasDemo": false
      },
      {
        "name": "$mdInkRippleProvider",
        "type": "service",
        "outputPath": "partials/api/material.core.ripple/service/$mdInkRippleProvider.html",
        "url": "api/service/$mdInkRippleProvider",
        "label": "$mdInkRippleProvider",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/ripple/ripple.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.theming",
    "type": "module",
    "outputPath": "partials/api/material.core.theming/index.html",
    "url": "api/material.core.theming",
    "label": "material.core.theming",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/theming/theming.js",
    "docs": [
      {
        "name": "$mdThemingProvider",
        "type": "service",
        "outputPath": "partials/api/material.core.theming/service/$mdThemingProvider.html",
        "url": "api/service/$mdThemingProvider",
        "label": "$mdThemingProvider",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/theming/theming.js",
        "hasDemo": false
      },
      {
        "name": "$mdTheming",
        "type": "service",
        "outputPath": "partials/api/material.core.theming/service/$mdTheming.html",
        "url": "api/service/$mdTheming",
        "label": "$mdTheming",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/services/theming/theming.js",
        "hasDemo": false
      }
    ],
    "hasDemo": false
  },
  {
    "name": "material.core.util",
    "type": "module",
    "outputPath": "partials/api/material.core.util/index.html",
    "url": "api/material.core.util",
    "label": "material.core.util",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/util/util.js",
    "docs": [
      {
        "name": "mdAutofocus",
        "type": "directive",
        "restrict": {
          "element": true,
          "attribute": true,
          "cssClass": false,
          "comment": false
        },
        "outputPath": "partials/api/material.core.util/directive/mdAutofocus.html",
        "url": "api/directive/mdAutofocus",
        "label": "mdAutofocus",
        "module": "material.core",
        "githubUrl": "https://github.com/angular/material/blob/master/src/core/util/autofocus.js",
        "hasDemo": true
      }
    ],
    "hasDemo": false
  }
]);

angular.module('docsApp').constant('PAGES', {
  "CSS": [
    {
      "name": "button",
      "outputPath": "partials/CSS/button.html",
      "url": "/CSS/button",
      "label": "button"
    },
    {
      "name": "checkbox",
      "outputPath": "partials/CSS/checkbox.html",
      "url": "/CSS/checkbox",
      "label": "checkbox"
    },
    {
      "name": "Typography",
      "outputPath": "partials/CSS/typography.html",
      "url": "/CSS/typography",
      "label": "Typography"
    }
  ],
  "migration.md": [
    {
      "name": "Migration to Angular Material",
      "outputPath": "partials/migration.html",
      "url": "/migration",
      "label": "Migration to Angular Material"
    }
  ],
  "performance": [
    {
      "name": "Internet Explorer",
      "outputPath": "partials/performance/internet-explorer.html",
      "url": "/performance/internet-explorer",
      "label": "Internet Explorer"
    }
  ],
  "Theming": [
    {
      "name": "Introduction and Terms",
      "outputPath": "partials/Theming/01_introduction.html",
      "url": "/Theming/01_introduction",
      "label": "Introduction and Terms"
    },
    {
      "name": "Declarative Syntax",
      "outputPath": "partials/Theming/02_declarative_syntax.html",
      "url": "/Theming/02_declarative_syntax",
      "label": "Declarative Syntax"
    },
    {
      "name": "Configuring a Theme",
      "outputPath": "partials/Theming/03_configuring_a_theme.html",
      "url": "/Theming/03_configuring_a_theme",
      "label": "Configuring a Theme"
    },
    {
      "name": "Multiple Themes",
      "outputPath": "partials/Theming/04_multiple_themes.html",
      "url": "/Theming/04_multiple_themes",
      "label": "Multiple Themes"
    },
    {
      "name": "Theming under the hood",
      "outputPath": "partials/Theming/05_under_the_hood.html",
      "url": "/Theming/05_under_the_hood",
      "label": "Theming under the hood"
    },
    {
      "name": "Browser Colors",
      "outputPath": "partials/Theming/06_browser_color.html",
      "url": "/Theming/06_browser_color",
      "label": "Browser Colors"
    }
  ]
});

(function() {
  angular.module('docsApp')
    .directive('docsCssApiTable', DocsCssApiTableDirective)
    .directive('docsCssSelector', DocsCssSelectorDirective);

  function DocsCssApiTableDirective() {
    return {
      restrict: 'E',
      transclude: true,

      bindToController: true,
      controller: function() {},
      controllerAs: '$ctrl',

      scope: {},

      template:
      '<table class="md-api-table md-css-table">' +
      '  <thead>' +
      '    <tr><th>Available Selectors</th></tr>' +
      '  </thead>' +
      '  <tbody ng-transclude>' +
      '  </tbody>' +
      '</table>'
    }
  }

  function DocsCssSelectorDirective() {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,

      bindToController: true,
      controller: function() {},
      controllerAs: '$ctrl',

      scope: {
        code: '@'
      },

      template:
      '<tr>' +
      '  <td>' +
      '    <code class="md-css-selector">{{$ctrl.code}}</code>' +
      '    <span ng-transclude></span>' +
      '  </td>' +
      '</tr>'
    }
  }
})();

angular.module('docsApp').constant('DEMOS', [
  {
    "name": "autocomplete",
    "moduleName": "material.components.autocomplete",
    "label": "Autocomplete",
    "demos": [
      {
        "ngModule": {
          "name": "autocompleteDemo",
          "module": "autocompleteDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "autocompletedemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "autocompleteCustomTemplateDemo",
          "module": "autocompleteCustomTemplateDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "autocompletedemoCustomTemplate",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/autocomplete/demoCustomTemplate/style.global.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoCustomTemplate/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoCustomTemplate",
        "label": "Custom Template",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoCustomTemplate/index.html"
        }
      },
      {
        "ngModule": {
          "name": "autocompleteFloatingLabelDemo",
          "module": "autocompleteFloatingLabelDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "autocompletedemoFloatingLabel",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoFloatingLabel/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoFloatingLabel",
        "label": "Floating Label",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoFloatingLabel/index.html"
        }
      },
      {
        "ngModule": {
          "name": "autocompleteDemoInsideDialog",
          "module": "autocompleteDemoInsideDialog",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "autocompletedemoInsideDialog",
        "css": [],
        "html": [
          {
            "name": "dialog.tmpl.html",
            "label": "dialog.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/autocomplete/demoInsideDialog/dialog.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoInsideDialog/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoInsideDialog",
        "label": "Inside Dialog",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoInsideDialog/index.html"
        }
      },
      {
        "ngModule": {
          "name": "autocompleteRepeatModeDemo",
          "module": "autocompleteRepeatModeDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "autocompletedemoRepeatMode",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/autocomplete/demoRepeatMode/style.global.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/autocomplete/demoRepeatMode/script.js"
          }
        ],
        "moduleName": "material.components.autocomplete",
        "name": "demoRepeatMode",
        "label": "Repeat Mode",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/autocomplete/demoRepeatMode/index.html"
        }
      }
    ],
    "url": "demo/autocomplete"
  },
  {
    "name": "bottomSheet",
    "moduleName": "material.components.bottomSheet",
    "label": "Bottom Sheet",
    "demos": [
      {
        "ngModule": {
          "name": "bottomSheetDemo1",
          "module": "bottomSheetDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "bottomSheetdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "bottom-sheet-grid-template.html",
            "label": "bottom-sheet-grid-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/bottom-sheet-grid-template.html"
          },
          {
            "name": "bottom-sheet-list-template.html",
            "label": "bottom-sheet-list-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/bottom-sheet-list-template.html"
          },
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/bottomSheet/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.bottomSheet",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/bottomSheet/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/bottomSheet"
  },
  {
    "name": "button",
    "moduleName": "material.components.button",
    "label": "Button",
    "demos": [
      {
        "ngModule": {
          "name": "buttonsDemoBasic",
          "module": "buttonsDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "buttondemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/button/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/button/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.button",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/button/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/button"
  },
  {
    "name": "card",
    "moduleName": "material.components.card",
    "label": "Card",
    "demos": [
      {
        "ngModule": {
          "name": "cardDemo1",
          "module": "cardDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "carddemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/card/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/card/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.card",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/card/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "cardDemo2",
          "module": "cardDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "carddemoCardActionButtons",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/card/demoCardActionButtons/script.js"
          }
        ],
        "moduleName": "material.components.card",
        "name": "demoCardActionButtons",
        "label": "Card Action Buttons",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/card/demoCardActionButtons/index.html"
        }
      },
      {
        "ngModule": {
          "name": "cardDemo3",
          "module": "cardDemo3",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "carddemoInCardActions",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/card/demoInCardActions/script.js"
          }
        ],
        "moduleName": "material.components.card",
        "name": "demoInCardActions",
        "label": "In Card Actions",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/card/demoInCardActions/index.html"
        }
      }
    ],
    "url": "demo/card"
  },
  {
    "name": "checkbox",
    "moduleName": "material.components.checkbox",
    "label": "Checkbox",
    "demos": [
      {
        "ngModule": {
          "name": "checkboxDemo1",
          "module": "checkboxDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "checkboxdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "checkboxDemo3",
          "module": "checkboxDemo3",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "checkboxdemoSelectAll",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoSelectAll/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoSelectAll/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoSelectAll",
        "label": "Select All",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoSelectAll/index.html"
        }
      },
      {
        "ngModule": {
          "name": "checkboxDemo2",
          "module": "checkboxDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "checkboxdemoSyncing",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/checkbox/demoSyncing/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/checkbox/demoSyncing/script.js"
          }
        ],
        "moduleName": "material.components.checkbox",
        "name": "demoSyncing",
        "label": "Syncing",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/checkbox/demoSyncing/index.html"
        }
      }
    ],
    "url": "demo/checkbox"
  },
  {
    "name": "chips",
    "moduleName": "material.components.chips",
    "label": "Chips",
    "demos": [
      {
        "ngModule": {
          "name": "chipsDemo",
          "module": "chipsDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "chipsdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/chips/demoBasicUsage/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "contactChipsDemo",
          "module": "contactChipsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoContactChips",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoContactChips/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoContactChips/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoContactChips",
        "label": "Contact Chips",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoContactChips/index.html"
        }
      },
      {
        "ngModule": {
          "name": "chipsCustomInputDemo",
          "module": "chipsCustomInputDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoCustomInputs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoCustomInputs/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoCustomInputs/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoCustomInputs",
        "label": "Custom Inputs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoCustomInputs/index.html"
        }
      },
      {
        "ngModule": {
          "name": "chipsCustomSeparatorDemo",
          "module": "chipsCustomSeparatorDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoCustomSeparatorKeys",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoCustomSeparatorKeys/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoCustomSeparatorKeys/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoCustomSeparatorKeys",
        "label": "Custom Separator Keys",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoCustomSeparatorKeys/index.html"
        }
      },
      {
        "ngModule": {
          "name": "staticChipsDemo",
          "module": "staticChipsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "chipsdemoStaticChips",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoStaticChips/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoStaticChips/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoStaticChips",
        "label": "Static Chips",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoStaticChips/index.html"
        }
      },
      {
        "ngModule": {
          "name": "chipsValidationDemo",
          "module": "chipsValidationDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "chipsdemoValidation",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/chips/demoValidation/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/chips/demoValidation/script.js"
          }
        ],
        "moduleName": "material.components.chips",
        "name": "demoValidation",
        "label": "Validation",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/chips/demoValidation/index.html"
        }
      }
    ],
    "url": "demo/chips"
  },
  {
    "name": "colors",
    "moduleName": "material.components.colors",
    "label": "Colors",
    "demos": [
      {
        "ngModule": {
          "name": "colorsDemo",
          "module": "colorsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "colorsdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/colors/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "regularCard.tmpl.html",
            "label": "regularCard.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/colors/demoBasicUsage/regularCard.tmpl.html"
          },
          {
            "name": "userCard.tmpl.html",
            "label": "userCard.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/colors/demoBasicUsage/userCard.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/colors/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.colors",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/colors/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "colorsThemePickerDemo",
          "module": "colorsThemePickerDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "colorsdemoThemePicker",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/colors/demoThemePicker/style.css"
          }
        ],
        "html": [
          {
            "name": "themePreview.tmpl.html",
            "label": "themePreview.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/colors/demoThemePicker/themePreview.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/colors/demoThemePicker/script.js"
          }
        ],
        "moduleName": "material.components.colors",
        "name": "demoThemePicker",
        "label": "Theme Picker",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/colors/demoThemePicker/index.html"
        }
      }
    ],
    "url": "demo/colors"
  },
  {
    "name": "content",
    "moduleName": "material.components.content",
    "label": "Content",
    "demos": [
      {
        "ngModule": {
          "name": "contentDemo1",
          "module": "contentDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "contentdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/content/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/content/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.content",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/content/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/content"
  },
  {
    "name": "datepicker",
    "moduleName": "material.components.datepicker",
    "label": "Datepicker",
    "demos": [
      {
        "ngModule": {
          "name": "datepickerBasicUsage",
          "module": "datepickerBasicUsage",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "datepickerdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/datepicker/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.datepicker",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/datepicker/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "calendarDemo",
          "module": "calendarDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "datepickerdemoCalendar",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/datepicker/demoCalendar/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/datepicker/demoCalendar/script.js"
          }
        ],
        "moduleName": "material.components.datepicker",
        "name": "demoCalendar",
        "label": "Calendar",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/datepicker/demoCalendar/index.html"
        }
      },
      {
        "ngModule": {
          "name": "datepickerMoment",
          "module": "datepickerMoment",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "datepickerdemoMoment",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/datepicker/demoMoment/script.js"
          }
        ],
        "moduleName": "material.components.datepicker",
        "name": "demoMoment",
        "label": "Moment",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/datepicker/demoMoment/index.html"
        }
      },
      {
        "ngModule": {
          "name": "customDatepickerMoment",
          "module": "customDatepickerMoment",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "datepickerdemoMomentCustomFormat",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/datepicker/demoMomentCustomFormat/script.js"
          }
        ],
        "moduleName": "material.components.datepicker",
        "name": "demoMomentCustomFormat",
        "label": "Moment Custom Format",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/datepicker/demoMomentCustomFormat/index.html"
        }
      },
      {
        "ngModule": {
          "name": "datepickerValidations",
          "module": "datepickerValidations",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "datepickerdemoValidations",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/datepicker/demoValidations/script.js"
          }
        ],
        "moduleName": "material.components.datepicker",
        "name": "demoValidations",
        "label": "Validations",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/datepicker/demoValidations/index.html"
        }
      }
    ],
    "url": "demo/datepicker"
  },
  {
    "name": "dialog",
    "moduleName": "material.components.dialog",
    "label": "Dialog",
    "demos": [
      {
        "ngModule": {
          "name": "dialogDemo1",
          "module": "dialogDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dialogdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/dialog/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "dialog1.tmpl.html",
            "label": "dialog1.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/dialog/demoBasicUsage/dialog1.tmpl.html"
          },
          {
            "name": "tabDialog.tmpl.html",
            "label": "tabDialog.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/dialog/demoBasicUsage/tabDialog.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/dialog/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.dialog",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/dialog/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "dialogDemo2",
          "module": "dialogDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dialogdemoOpenFromCloseTo",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/dialog/demoOpenFromCloseTo/script.js"
          }
        ],
        "moduleName": "material.components.dialog",
        "name": "demoOpenFromCloseTo",
        "label": "Open From Close To",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/dialog/demoOpenFromCloseTo/index.html"
        }
      },
      {
        "ngModule": {
          "name": "dialogDemo3",
          "module": "dialogDemo3",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dialogdemoThemeInheritance",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/dialog/demoThemeInheritance/style.css"
          }
        ],
        "html": [
          {
            "name": "dialog1.tmpl.html",
            "label": "dialog1.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/dialog/demoThemeInheritance/dialog1.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/dialog/demoThemeInheritance/script.js"
          }
        ],
        "moduleName": "material.components.dialog",
        "name": "demoThemeInheritance",
        "label": "Theme Inheritance",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/dialog/demoThemeInheritance/index.html"
        }
      }
    ],
    "url": "demo/dialog"
  },
  {
    "name": "divider",
    "moduleName": "material.components.divider",
    "label": "Divider",
    "demos": [
      {
        "ngModule": {
          "name": "dividerDemo1",
          "module": "dividerDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "dividerdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/divider/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.divider",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/divider/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/divider"
  },
  {
    "name": "fabSpeedDial",
    "moduleName": "material.components.fabSpeedDial",
    "label": "FAB Speed Dial",
    "demos": [
      {
        "ngModule": {
          "name": "fabSpeedDialDemoBasicUsage",
          "module": "fabSpeedDialDemoBasicUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "fabSpeedDialdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/fabSpeedDial/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/fabSpeedDial/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.fabSpeedDial",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/fabSpeedDial/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "fabSpeedDialDemoMoreOptions",
          "module": "fabSpeedDialDemoMoreOptions",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "fabSpeedDialdemoMoreOptions",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/fabSpeedDial/demoMoreOptions/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/fabSpeedDial/demoMoreOptions/script.js"
          }
        ],
        "moduleName": "material.components.fabSpeedDial",
        "name": "demoMoreOptions",
        "label": "More Options",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/fabSpeedDial/demoMoreOptions/index.html"
        }
      }
    ],
    "url": "demo/fabSpeedDial"
  },
  {
    "name": "fabToolbar",
    "moduleName": "material.components.fabToolbar",
    "label": "FAB Toolbar",
    "demos": [
      {
        "ngModule": {
          "name": "fabToolbarBasicUsageDemo",
          "module": "fabToolbarBasicUsageDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "fabToolbardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/fabToolbar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/fabToolbar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.fabToolbar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/fabToolbar/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/fabToolbar"
  },
  {
    "name": "gridList",
    "moduleName": "material.components.gridList",
    "label": "Grid List",
    "demos": [
      {
        "ngModule": {
          "name": "gridListDemo1",
          "module": "gridListDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "gridListdemoBasicUsage",
        "css": [
          {
            "name": "styles.css",
            "label": "styles.css",
            "fileType": "css",
            "outputPath": "demo-partials/gridList/demoBasicUsage/styles.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "gridListDemoApp",
          "module": "gridListDemoApp",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "gridListdemoDynamicTiles",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/gridList/demoDynamicTiles/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoDynamicTiles/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoDynamicTiles",
        "label": "Dynamic Tiles",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoDynamicTiles/index.html"
        }
      },
      {
        "ngModule": {
          "name": "gridListDemo1",
          "module": "gridListDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "gridListdemoResponsiveUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/gridList/demoResponsiveUsage/script.js"
          }
        ],
        "moduleName": "material.components.gridList",
        "name": "demoResponsiveUsage",
        "label": "Responsive Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/gridList/demoResponsiveUsage/index.html"
        }
      }
    ],
    "url": "demo/gridList"
  },
  {
    "name": "icon",
    "moduleName": "material.components.icon",
    "label": "Icon",
    "demos": [
      {
        "ngModule": {
          "name": "appDemoFontIconsWithClassnames",
          "module": "appDemoFontIconsWithClassnames",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoFontIconsWithClassnames",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoFontIconsWithClassnames/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoFontIconsWithClassnames/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoFontIconsWithClassnames",
        "label": "Font Icons With Classnames",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoFontIconsWithClassnames/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appDemoFontIconsWithLigatures",
          "module": "appDemoFontIconsWithLigatures",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoFontIconsWithLigatures",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoFontIconsWithLigatures/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoFontIconsWithLigatures/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoFontIconsWithLigatures",
        "label": "Font Icons With Ligatures",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoFontIconsWithLigatures/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appDemoSvgIcons",
          "module": "appDemoSvgIcons",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoLoadSvgIconsFromUrl",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoLoadSvgIconsFromUrl",
        "label": "Load Svg Icons From Url",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoLoadSvgIconsFromUrl/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appSvgIconSets",
          "module": "appSvgIconSets",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoSvgIconSets",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoSvgIconSets/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoSvgIconSets/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoSvgIconSets",
        "label": "Svg Icon Sets",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoSvgIconSets/index.html"
        }
      },
      {
        "ngModule": {
          "name": "appUsingTemplateCache",
          "module": "appUsingTemplateCache",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "icondemoUsingTemplateRequest",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/icon/demoUsingTemplateRequest/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/icon/demoUsingTemplateRequest/script.js"
          }
        ],
        "moduleName": "material.components.icon",
        "name": "demoUsingTemplateRequest",
        "label": "Using Template Request",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/icon/demoUsingTemplateRequest/index.html"
        }
      }
    ],
    "url": "demo/icon"
  },
  {
    "name": "input",
    "moduleName": "material.components.input",
    "label": "Input",
    "demos": [
      {
        "ngModule": {
          "name": "inputBasicDemo",
          "module": "inputBasicDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "inputErrorsApp",
          "module": "inputErrorsApp",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoErrors",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoErrors/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoErrors/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoErrors",
        "label": "Errors",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoErrors/index.html"
        }
      },
      {
        "ngModule": {
          "name": "inputErrorsAdvancedApp",
          "module": "inputErrorsAdvancedApp",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoErrorsAdvanced",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoErrorsAdvanced/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoErrorsAdvanced/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoErrorsAdvanced",
        "label": "Errors Advanced",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoErrorsAdvanced/index.html"
        }
      },
      {
        "ngModule": {
          "name": "inputIconDemo",
          "module": "inputIconDemo",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "inputdemoIcons",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/input/demoIcons/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/input/demoIcons/script.js"
          }
        ],
        "moduleName": "material.components.input",
        "name": "demoIcons",
        "label": "Icons",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/input/demoIcons/index.html"
        }
      }
    ],
    "url": "demo/input"
  },
  {
    "name": "list",
    "moduleName": "material.components.list",
    "label": "List",
    "demos": [
      {
        "ngModule": {
          "name": "listDemo1",
          "module": "listDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "listdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/list/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/list/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.list",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/list/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "listDemo2",
          "module": "listDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "listdemoListControls",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/list/demoListControls/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/list/demoListControls/script.js"
          }
        ],
        "moduleName": "material.components.list",
        "name": "demoListControls",
        "label": "List Controls",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/list/demoListControls/index.html"
        }
      }
    ],
    "url": "demo/list"
  },
  {
    "name": "menu",
    "moduleName": "material.components.menu",
    "label": "Menu",
    "demos": [
      {
        "ngModule": {
          "name": "menuDemoBasic",
          "module": "menuDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuDemoCustomTrigger",
          "module": "menuDemoCustomTrigger",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoCustomTrigger",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoCustomTrigger/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoCustomTrigger/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoCustomTrigger",
        "label": "Custom Trigger",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoCustomTrigger/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuDemoDensity",
          "module": "menuDemoDensity",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoMenuDensity",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoMenuDensity/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoMenuDensity/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoMenuDensity",
        "label": "Menu Density",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoMenuDensity/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuDemoPosition",
          "module": "menuDemoPosition",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoMenuPositionModes",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoMenuPositionModes/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoMenuPositionModes/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoMenuPositionModes",
        "label": "Menu Position Modes",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoMenuPositionModes/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuDemoWidth",
          "module": "menuDemoWidth",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menudemoMenuWidth",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menu/demoMenuWidth/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menu/demoMenuWidth/script.js"
          }
        ],
        "moduleName": "material.components.menu",
        "name": "demoMenuWidth",
        "label": "Menu Width",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menu/demoMenuWidth/index.html"
        }
      }
    ],
    "url": "demo/menu"
  },
  {
    "name": "menuBar",
    "moduleName": "material.components.menuBar",
    "label": "Menu Bar",
    "demos": [
      {
        "ngModule": {
          "name": "menuBarDemoBasic",
          "module": "menuBarDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menuBardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menuBar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menuBar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.menuBar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menuBar/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "menuBarDemoDynamicNestedMenus",
          "module": "menuBarDemoDynamicNestedMenus",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "menuBardemoDynamicNestedMenus",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/menuBar/demoDynamicNestedMenus/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/menuBar/demoDynamicNestedMenus/script.js"
          }
        ],
        "moduleName": "material.components.menuBar",
        "name": "demoDynamicNestedMenus",
        "label": "Dynamic Nested Menus",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/menuBar/demoDynamicNestedMenus/index.html"
        }
      }
    ],
    "url": "demo/menuBar"
  },
  {
    "name": "navBar",
    "moduleName": "material.components.navBar",
    "label": "Nav Bar",
    "demos": [
      {
        "ngModule": {
          "name": "navBarDemoBasicUsage",
          "module": "navBarDemoBasicUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "navBardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/navBar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/navBar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.navBar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/navBar/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/navBar"
  },
  {
    "name": "panel",
    "moduleName": "material.components.panel",
    "label": "Panel",
    "demos": [
      {
        "ngModule": {
          "name": "panelDemo",
          "module": "panelDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoBasicUsage",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoBasicUsage/style.global.css"
          }
        ],
        "html": [
          {
            "name": "panel.tmpl.html",
            "label": "panel.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/panel/demoBasicUsage/panel.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "panelGroupsDemo",
          "module": "panelGroupsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoGroups",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoGroups/style.global.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoGroups/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoGroups",
        "label": "Groups",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoGroups/index.html"
        }
      },
      {
        "ngModule": {
          "name": "panelAnimationsDemo",
          "module": "panelAnimationsDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoPanelAnimations",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoPanelAnimations/style.global.css"
          }
        ],
        "html": [
          {
            "name": "panel.tmpl.html",
            "label": "panel.tmpl.html",
            "fileType": "html",
            "outputPath": "demo-partials/panel/demoPanelAnimations/panel.tmpl.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoPanelAnimations/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoPanelAnimations",
        "label": "Panel Animations",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoPanelAnimations/index.html"
        }
      },
      {
        "ngModule": {
          "name": "panelProviderDemo",
          "module": "panelProviderDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "paneldemoPanelProvider",
        "css": [
          {
            "name": "style.global.css",
            "label": "style.global.css",
            "fileType": "css",
            "outputPath": "demo-partials/panel/demoPanelProvider/style.global.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/panel/demoPanelProvider/script.js"
          }
        ],
        "moduleName": "material.components.panel",
        "name": "demoPanelProvider",
        "label": "Panel Provider",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/panel/demoPanelProvider/index.html"
        }
      }
    ],
    "url": "demo/panel"
  },
  {
    "name": "progressCircular",
    "moduleName": "material.components.progressCircular",
    "label": "Progress Circular",
    "demos": [
      {
        "ngModule": {
          "name": "progressCircularDemo1",
          "module": "progressCircularDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "progressCirculardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/progressCircular/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/progressCircular/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.progressCircular",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/progressCircular/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/progressCircular"
  },
  {
    "name": "progressLinear",
    "moduleName": "material.components.progressLinear",
    "label": "Progress Linear",
    "demos": [
      {
        "ngModule": {
          "name": "progressLinearDemo1",
          "module": "progressLinearDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "progressLineardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/progressLinear/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/progressLinear/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.progressLinear",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/progressLinear/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/progressLinear"
  },
  {
    "name": "radioButton",
    "moduleName": "material.components.radioButton",
    "label": "Radio Button",
    "demos": [
      {
        "ngModule": {
          "name": "radioDemo1",
          "module": "radioDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "radioButtondemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/radioButton/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/radioButton/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.radioButton",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/radioButton/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "radioDemo2",
          "module": "radioDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "radioButtondemoMultiColumn",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/radioButton/demoMultiColumn/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/radioButton/demoMultiColumn/script.js"
          }
        ],
        "moduleName": "material.components.radioButton",
        "name": "demoMultiColumn",
        "label": "Multi Column",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/radioButton/demoMultiColumn/index.html"
        }
      }
    ],
    "url": "demo/radioButton"
  },
  {
    "name": "select",
    "moduleName": "material.components.select",
    "label": "Select",
    "demos": [
      {
        "ngModule": {
          "name": "selectDemoBasic",
          "module": "selectDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoOptGroups",
          "module": "selectDemoOptGroups",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoOptionGroups",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoOptionGroups/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoOptionGroups",
        "label": "Option Groups",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoOptionGroups/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoOptionsAsync",
          "module": "selectDemoOptionsAsync",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoOptionsWithAsyncSearch",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoOptionsWithAsyncSearch/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoOptionsWithAsyncSearch",
        "label": "Options With Async Search",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoOptionsWithAsyncSearch/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoSelectHeader",
          "module": "selectDemoSelectHeader",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoSelectHeader",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/select/demoSelectHeader/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoSelectHeader/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoSelectHeader",
        "label": "Select Header",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoSelectHeader/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoSelectedText",
          "module": "selectDemoSelectedText",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "selectdemoSelectedText",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoSelectedText/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoSelectedText",
        "label": "Selected Text",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoSelectedText/index.html"
        }
      },
      {
        "ngModule": {
          "name": "selectDemoValidation",
          "module": "selectDemoValidation",
          "dependencies": [
            "ngMaterial",
            "ngMessages"
          ]
        },
        "id": "selectdemoValidations",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/select/demoValidations/script.js"
          }
        ],
        "moduleName": "material.components.select",
        "name": "demoValidations",
        "label": "Validations",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/select/demoValidations/index.html"
        }
      }
    ],
    "url": "demo/select"
  },
  {
    "name": "sidenav",
    "moduleName": "material.components.sidenav",
    "label": "Sidenav",
    "demos": [
      {
        "ngModule": {
          "name": "basicUsageSidenavDemo",
          "module": "basicUsageSidenavDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sidenavdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/sidenav/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.sidenav",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/sidenav/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "customSidenavDemo",
          "module": "customSidenavDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sidenavdemoCustomSidenav",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/sidenav/demoCustomSidenav/script.js"
          }
        ],
        "moduleName": "material.components.sidenav",
        "name": "demoCustomSidenav",
        "label": "Custom Sidenav",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/sidenav/demoCustomSidenav/index.html"
        }
      },
      {
        "ngModule": {
          "name": "disableCloseEventsSidenavDemo",
          "module": "disableCloseEventsSidenavDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sidenavdemoDisableCloseEvents",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/sidenav/demoDisableCloseEvents/script.js"
          }
        ],
        "moduleName": "material.components.sidenav",
        "name": "demoDisableCloseEvents",
        "label": "Disable Close Events",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/sidenav/demoDisableCloseEvents/index.html"
        }
      }
    ],
    "url": "demo/sidenav"
  },
  {
    "name": "slider",
    "moduleName": "material.components.slider",
    "label": "Slider",
    "demos": [
      {
        "ngModule": {
          "name": "sliderDemoBasic",
          "module": "sliderDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sliderdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/slider/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.slider",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/slider/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "sliderDemoVertical",
          "module": "sliderDemoVertical",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "sliderdemoVertical",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/slider/demoVertical/script.js"
          }
        ],
        "moduleName": "material.components.slider",
        "name": "demoVertical",
        "label": "Vertical",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/slider/demoVertical/index.html"
        }
      }
    ],
    "url": "demo/slider"
  },
  {
    "name": "subheader",
    "moduleName": "material.components.subheader",
    "label": "Subheader",
    "demos": [
      {
        "ngModule": {
          "name": "subheaderBasicDemo",
          "module": "subheaderBasicDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "subheaderdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/subheader/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/subheader/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.subheader",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/subheader/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/subheader"
  },
  {
    "name": "swipe",
    "moduleName": "material.components.swipe",
    "label": "Swipe",
    "demos": [
      {
        "ngModule": {
          "name": "demoSwipe",
          "module": "demoSwipe",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "swipedemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/swipe/demoBasicUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/swipe/demoBasicUsage/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/swipe/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.swipe",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/swipe/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/swipe"
  },
  {
    "name": "switch",
    "moduleName": "material.components.switch",
    "label": "Switch",
    "demos": [
      {
        "ngModule": {
          "name": "switchDemo1",
          "module": "switchDemo1",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "switchdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/switch/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/switch/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.switch",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/switch/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/switch"
  },
  {
    "name": "tabs",
    "moduleName": "material.components.tabs",
    "label": "Tabs",
    "demos": [
      {
        "ngModule": {
          "name": "tabsDemoCenterTabs",
          "module": "tabsDemoCenterTabs",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tabsdemoCenterTabs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoCenterTabs/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoCenterTabs/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoCenterTabs",
        "label": "Center Tabs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoCenterTabs/index.html"
        }
      },
      {
        "ngModule": {
          "name": "tabsDemoDynamicHeight",
          "module": "tabsDemoDynamicHeight",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tabsdemoDynamicHeight",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoDynamicHeight/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoDynamicHeight",
        "label": "Dynamic Height",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoDynamicHeight/index.html"
        }
      },
      {
        "ngModule": {
          "name": "tabsDemoDynamicTabs",
          "module": "tabsDemoDynamicTabs",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tabsdemoDynamicTabs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoDynamicTabs/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoDynamicTabs",
        "label": "Dynamic Tabs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoDynamicTabs/index.html"
        }
      },
      {
        "ngModule": {
          "name": "tabsDemoIconTabs",
          "module": "tabsDemoIconTabs",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tabsdemoStaticTabs",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/tabs/demoStaticTabs/style.css"
          }
        ],
        "html": [
          {
            "name": "readme.html",
            "label": "readme.html",
            "fileType": "html",
            "outputPath": "demo-partials/tabs/demoStaticTabs/readme.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tabs/demoStaticTabs/script.js"
          }
        ],
        "moduleName": "material.components.tabs",
        "name": "demoStaticTabs",
        "label": "Static Tabs",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tabs/demoStaticTabs/index.html"
        }
      }
    ],
    "url": "demo/tabs"
  },
  {
    "name": "toast",
    "moduleName": "material.components.toast",
    "label": "Toast",
    "demos": [
      {
        "ngModule": {
          "name": "toastBasicDemo",
          "module": "toastBasicDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toastdemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toast/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toast/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.toast",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toast/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "toastCustomDemo",
          "module": "toastCustomDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toastdemoCustomUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toast/demoCustomUsage/style.css"
          }
        ],
        "html": [
          {
            "name": "toast-template.html",
            "label": "toast-template.html",
            "fileType": "html",
            "outputPath": "demo-partials/toast/demoCustomUsage/toast-template.html"
          }
        ],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toast/demoCustomUsage/script.js"
          }
        ],
        "moduleName": "material.components.toast",
        "name": "demoCustomUsage",
        "label": "Custom Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toast/demoCustomUsage/index.html"
        }
      }
    ],
    "url": "demo/toast"
  },
  {
    "name": "toolbar",
    "moduleName": "material.components.toolbar",
    "label": "Toolbar",
    "demos": [
      {
        "ngModule": {
          "name": "toolbarDemoBasic",
          "module": "toolbarDemoBasic",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toolbardemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toolbar/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toolbar/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.toolbar",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toolbar/demoBasicUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "toolbarDemo2",
          "module": "toolbarDemo2",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "toolbardemoScrollShrink",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/toolbar/demoScrollShrink/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/toolbar/demoScrollShrink/script.js"
          }
        ],
        "moduleName": "material.components.toolbar",
        "name": "demoScrollShrink",
        "label": "Scroll Shrink",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/toolbar/demoScrollShrink/index.html"
        }
      }
    ],
    "url": "demo/toolbar"
  },
  {
    "name": "tooltip",
    "moduleName": "material.components.tooltip",
    "label": "Tooltip",
    "demos": [
      {
        "ngModule": {
          "name": "tooltipDemo",
          "module": "tooltipDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "tooltipdemoBasicUsage",
        "css": [],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/tooltip/demoBasicUsage/script.js"
          }
        ],
        "moduleName": "material.components.tooltip",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/tooltip/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/tooltip"
  },
  {
    "name": "truncate",
    "moduleName": "material.components.truncate",
    "label": "Truncate",
    "demos": [
      {
        "ngModule": "",
        "id": "truncatedemoBasicUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/truncate/demoBasicUsage/style.css"
          }
        ],
        "html": [],
        "js": [],
        "moduleName": "material.components.truncate",
        "name": "demoBasicUsage",
        "label": "Basic Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/truncate/demoBasicUsage/index.html"
        }
      }
    ],
    "url": "demo/truncate"
  },
  {
    "name": "virtualRepeat",
    "moduleName": "material.components.virtualRepeat",
    "label": "Virtual Repeat",
    "demos": [
      {
        "ngModule": {
          "name": "virtualRepeatDeferredLoadingDemo",
          "module": "virtualRepeatDeferredLoadingDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoDeferredLoading",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoDeferredLoading/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoDeferredLoading/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoDeferredLoading",
        "label": "Deferred Loading",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoDeferredLoading/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatHorizontalDemo",
          "module": "virtualRepeatHorizontalDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoHorizontalUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoHorizontalUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoHorizontalUsage/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoHorizontalUsage",
        "label": "Horizontal Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoHorizontalUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatInfiniteScrollDemo",
          "module": "virtualRepeatInfiniteScrollDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoInfiniteScroll",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoInfiniteScroll/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoInfiniteScroll/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoInfiniteScroll",
        "label": "Infinite Scroll",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoInfiniteScroll/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatScrollToDemo",
          "module": "virtualRepeatScrollToDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoScrollTo",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoScrollTo/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoScrollTo/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoScrollTo",
        "label": "Scroll To",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoScrollTo/index.html"
        }
      },
      {
        "ngModule": {
          "name": "virtualRepeatVerticalDemo",
          "module": "virtualRepeatVerticalDemo",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "virtualRepeatdemoVerticalUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/virtualRepeat/demoVerticalUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/virtualRepeat/demoVerticalUsage/script.js"
          }
        ],
        "moduleName": "material.components.virtualRepeat",
        "name": "demoVerticalUsage",
        "label": "Vertical Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/virtualRepeat/demoVerticalUsage/index.html"
        }
      }
    ],
    "url": "demo/virtualRepeat"
  },
  {
    "name": "whiteframe",
    "moduleName": "material.components.whiteframe",
    "label": "Whiteframe",
    "demos": [
      {
        "ngModule": {
          "name": "whiteframeBasicUsage",
          "module": "whiteframeBasicUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "whiteframedemoBasicClassUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/whiteframe/demoBasicClassUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/whiteframe/demoBasicClassUsage/script.js"
          }
        ],
        "moduleName": "material.components.whiteframe",
        "name": "demoBasicClassUsage",
        "label": "Basic Class Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/whiteframe/demoBasicClassUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "whiteframeDirectiveUsage",
          "module": "whiteframeDirectiveUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "whiteframedemoDirectiveAttributeUsage",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/whiteframe/demoDirectiveAttributeUsage/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/whiteframe/demoDirectiveAttributeUsage/script.js"
          }
        ],
        "moduleName": "material.components.whiteframe",
        "name": "demoDirectiveAttributeUsage",
        "label": "Directive Attribute Usage",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/whiteframe/demoDirectiveAttributeUsage/index.html"
        }
      },
      {
        "ngModule": {
          "name": "whiteframeDirectiveUsage",
          "module": "whiteframeDirectiveUsage",
          "dependencies": [
            "ngMaterial"
          ]
        },
        "id": "whiteframedemoDirectiveInterpolation",
        "css": [
          {
            "name": "style.css",
            "label": "style.css",
            "fileType": "css",
            "outputPath": "demo-partials/whiteframe/demoDirectiveInterpolation/style.css"
          }
        ],
        "html": [],
        "js": [
          {
            "name": "script.js",
            "label": "script.js",
            "fileType": "js",
            "outputPath": "demo-partials/whiteframe/demoDirectiveInterpolation/script.js"
          }
        ],
        "moduleName": "material.components.whiteframe",
        "name": "demoDirectiveInterpolation",
        "label": "Directive Interpolation",
        "index": {
          "name": "index.html",
          "label": "index.html",
          "fileType": "html",
          "outputPath": "demo-partials/whiteframe/demoDirectiveInterpolation/index.html"
        }
      }
    ],
    "url": "demo/whiteframe"
  }
]);
angular.module('docsApp')
.directive('layoutAlign', function() { return angular.noop; })
.directive('layout', function() { return angular.noop; })
.directive('docsDemo', ['$mdUtil', function($mdUtil) {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'partials/docs-demo.tmpl.html',
    transclude: true,
    controller: ['$scope', '$element', '$attrs', '$interpolate', 'codepen', DocsDemoCtrl],
    controllerAs: 'demoCtrl',
    bindToController: true
  };

  function DocsDemoCtrl($scope, $element, $attrs, $interpolate, codepen) {
    var self = this;

    self.interpolateCode = angular.isDefined($attrs.interpolateCode);
    self.demoId = $interpolate($attrs.demoId || '')($scope.$parent);
    self.demoTitle = $interpolate($attrs.demoTitle || '')($scope.$parent);
    self.demoModule = $interpolate($attrs.demoModule || '')($scope.$parent);

    $attrs.$observe('demoTitle',  function(value) { self.demoTitle  = value || self.demoTitle; });
    $attrs.$observe('demoId',     function(value) { self.demoId     = value || self.demoId; });
    $attrs.$observe('demoModule', function(value) { self.demoModule = value || self.demoModule;  });

    self.files = {
      css: [], js: [], html: []
    };

    self.addFile = function(name, contentsPromise) {
      var file = {
        name: convertName(name),
        contentsPromise: contentsPromise,
        fileType: name.split('.').pop()
      };
      contentsPromise.then(function(contents) {
        file.contents = contents;
      });

      if (name === 'index.html') {
        self.files.index = file;
      } else if (name === 'readme.html') {
       self.demoDescription = file;
      } else {
        self.files[file.fileType] = self.files[file.fileType] || [];
        self.files[file.fileType].push(file);
      }

      self.orderedFiles = []
        .concat(self.files.index || [])
        .concat(self.files.js || [])
        .concat(self.files.css || [])
        .concat(self.files.html || []);

    };

    self.editOnCodepen = function() {
      codepen.editOnCodepen({
        title: self.demoTitle,
        files: self.files,
        id: self.demoId,
        module: self.demoModule
      });
    };

    function convertName(name) {
      switch (name) {
        case "index.html" : return "HTML";
        case "script.js" : return "JS";
        case "style.css" : return "CSS";
        case "style.global.css" : return "CSS";
        default : return name;
      }
    }

  }
}])
.directive('demoFile', ['$q', '$interpolate', function($q, $interpolate) {
  return {
    restrict: 'E',
    require: '^docsDemo',
    compile: compile
  };

  function compile(element, attr) {
    var contentsAttr = attr.contents;
    var html = element.html();
    var name = attr.name;
    element.contents().remove();

    return function postLink(scope, element, attr, docsDemoCtrl) {
      docsDemoCtrl.addFile(
        $interpolate(name)(scope),
        $q.when(scope.$eval(contentsAttr) || html)
      );
      element.remove();
    };
  }
}])

.filter('toHtml', ['$sce', function($sce) {
  return function(str) {
    return $sce.trustAsHtml(str);
  };
}]);

angular.module('docsApp').directive('demoInclude', [
  '$q',
  '$compile',
  '$timeout',
function($q, $compile, $timeout) {
  return {
    restrict: 'E',
    link: postLink
  };

  function postLink(scope, element, attr) {
    var demoContainer;

    // Interpret the expression given as `demo-include files="something"`
    var files = scope.$eval(attr.files) || {};
    var ngModule = scope.$eval(attr.module) || '';

    $timeout(handleDemoIndexFile);

    /**
     * Fetch the index file, and if it contains its own ngModule
     * then bootstrap a new angular app with that ngModule. Otherwise, compile
     * the demo into the current ng-app.
     */
    function handleDemoIndexFile() {
      files.index.contentsPromise.then(function(contents) {
        demoContainer = angular.element(
          '<div class="demo-content ' + ngModule + '">'
        );

        var isStandalone = !!ngModule;
        var demoScope;
        var demoCompileService;
        if (isStandalone) {
          angular.bootstrap(demoContainer[0], [ngModule]);
          demoScope = demoContainer.scope();
          demoCompileService = demoContainer.injector().get('$compile');
          scope.$on('$destroy', function() {
            demoScope.$destroy();
          });

        } else {
          demoScope = scope.$new();
          demoCompileService = $compile;
        }

        // Once everything is loaded, put the demo into the DOM
        $q.all([
          handleDemoStyles(),
          handleDemoTemplates()
        ]).finally(function() {
          demoScope.$evalAsync(function() {
            element.append(demoContainer);
            demoContainer.html(contents);
            demoCompileService(demoContainer.contents())(demoScope);
          });
        });
      });

    }


    /**
     * Fetch the demo styles, and append them to the DOM.
     */
    function handleDemoStyles() {
      return $q.all(files.css.map(function(file) {
        return file.contentsPromise;
      }))
      .then(function(styles) {
        styles = styles.join('\n'); // join styles as one string

        var styleElement = angular.element('<style>' + styles + '</style>');
        document.body.appendChild(styleElement[0]);

        scope.$on('$destroy', function() {
          styleElement.remove();
        });
      });

    }

    /**
     * Fetch the templates for this demo, and put the templates into
     * the demo app's templateCache, with a url that allows the demo apps
     * to reference their templates local to the demo index file.
     *
     * For example, make it so the dialog demo can reference templateUrl
     * 'my-dialog.tmpl.html' instead of having to reference the url
     * 'generated/material.components.dialog/demo/demo1/my-dialog.tmpl.html'.
     */
    function handleDemoTemplates() {
      return $q.all(files.html.map(function(file) {

        return file.contentsPromise.then(function(contents) {
          // Get the $templateCache instance that goes with the demo's specific ng-app.
          var demoTemplateCache = demoContainer.injector().get('$templateCache');
          demoTemplateCache.put(file.name, contents);

          scope.$on('$destroy', function() {
            demoTemplateCache.remove(file.name);
          });

        });

      }));

    }

  }

}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/contributors.tmpl.html',
    '<div ng-controller="GuideCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <p>\n' +
    '      We are thankful for the amazing community and <em>contributors</em> to AngularJS Material.<br/>\n' +
    '      Shown below is a list of all our contributors: developers who submitted fixes and improvements to AngularJS Material.\n' +
    '    </p>\n' +
    '    <md-divider></md-divider>\n' +
    '\n' +
    '    <h2>Contributors</h2>\n' +
    '\n' +
    '    <p style="margin-top:-10px;"> (sorted by number of commits)</p>\n' +
    '    <br/>\n' +
    '\n' +
    '    <div class="contributor_tables">\n' +
    '\n' +
    '      <!-- Use the \'contributors.json\' generated by \'gulp build-contributors\' -->\n' +
    '\n' +
    '      <table ng-repeat="row in github.contributors"> \n' +
    '        <thead>\n' +
    '        <tr>\n' +
    '          <th style="text-align:center" ng-repeat="user in row">\n' +
    '            <a href="{{user.html_url}}" >\n' +
    '              <img  alt="{{user.login}}"\n' +
    '                    ng-src="{{user.avatar_url}}"\n' +
    '                    width="{{github.imageSize}}" class="md-avatar">\n' +
    '            </a>\n' +
    '          </th>\n' +
    '        </tr>\n' +
    '        </thead>\n' +
    '        <tbody>\n' +
    '        <tr>\n' +
    '          <td style="text-align:center" ng-repeat="user in row">\n' +
    '            <a href="{{user.html_url}}" class="md-primary">{{user.login}}</a>\n' +
    '          </td>\n' +
    '          <td></td>\n' +
    '        </tr>\n' +
    '        </tbody>\n' +
    '      </table>\n' +
    '\n' +
    '    </div>\n' +
    '  </md-content>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/demo.tmpl.html',
    '<docs-demo\n' +
    '    ng-repeat="demo in demos"\n' +
    '    demo-id="{{demo.id}}"\n' +
    '    demo-title="{{demo.label}}"\n' +
    '    demo-module="{{demo.ngModule.module}}">\n' +
    '  <demo-file\n' +
    '      ng-repeat="file in demo.$files"\n' +
    '      name="{{file.name}}"\n' +
    '      contents="file.httpPromise"></demo-file>\n' +
    '</docs-demo>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/docs-demo.tmpl.html',
    '<div class="doc-demo-content doc-content">\n' +
    '  <div flex layout="column" style="z-index:1">\n' +
    '\n' +
    '    <div class="doc-description" ng-bind-html="demoCtrl.demoDescription.contents | toHtml"></div>\n' +
    '\n' +
    '    <div ng-transclude></div>\n' +
    '\n' +
    '    <section class="demo-container md-whiteframe-z1"\n' +
    '      ng-class="{\'show-source\': demoCtrl.$showSource}" >\n' +
    '\n' +
    '      <md-toolbar class="demo-toolbar md-primary">\n' +
    '        <div class="md-toolbar-tools">\n' +
    '          <h3>{{demoCtrl.demoTitle}}</h3>\n' +
    '          <span flex></span>\n' +
    '          <md-button\n' +
    '            class="md-icon-button"\n' +
    '            aria-label="View Source"\n' +
    '            ng-class="{ active: demoCtrl.$showSource }"\n' +
    '            ng-click="demoCtrl.$showSource = !demoCtrl.$showSource">\n' +
    '              <md-tooltip md-autohide>View Source</md-tooltip>\n' +
    '              <md-icon md-svg-src="img/icons/ic_code_24px.svg"></md-icon>\n' +
    '          </md-button>\n' +
    '          <md-button\n' +
    '              ng-hide="{{exampleNotEditable}}"\n' +
    '              hide-sm\n' +
    '              ng-click="demoCtrl.editOnCodepen()"\n' +
    '              aria-label="Edit on CodePen"\n' +
    '              class="md-icon-button">\n' +
    '            <md-tooltip md-autohide>Edit on CodePen</md-tooltip>\n' +
    '            <md-icon md-svg-src="img/icons/codepen-logo.svg"></md-icon>\n' +
    '          </md-button>\n' +
    '        </div>\n' +
    '      </md-toolbar>\n' +
    '\n' +
    '      <!-- Source views -->\n' +
    '      <md-tabs class="demo-source-tabs md-primary" ng-show="demoCtrl.$showSource" style="min-height: 0;">\n' +
    '        <md-tab ng-repeat="file in demoCtrl.orderedFiles" label="{{file.name}}">\n' +
    '          <md-content md-scroll-y class="demo-source-container">\n' +
    '            <hljs class="no-header" code="file.contentsPromise" lang="{{file.fileType}}" should-interpolate="demoCtrl.interpolateCode">\n' +
    '            </hljs>\n' +
    '          </md-content>\n' +
    '        </md-tab>\n' +
    '      </md-tabs>\n' +
    '\n' +
    '      <!-- Live Demos -->\n' +
    '      <demo-include files="demoCtrl.files" module="demoCtrl.demoModule" class="{{demoCtrl.demoId}}">\n' +
    '      </demo-include>\n' +
    '    </section>\n' +
    '\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/getting-started.tmpl.html',
    '<div ng-controller="GuideCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <p>\n' +
    '      <h2><em>New to AngularJS?</em> Before getting into AngularJS Material, it might be helpful to:</h2>\n' +
    '    </p>\n' +
    '    <p>\n' +
    '      <ul>\n' +
    '        <li>\n' +
    '          Watch videos about <a\n' +
    '            href="https://egghead.io/courses/angularjs-fundamentals" target="_blank"\n' +
    '            title="AngularJS Framework">AngularJS Fundamentals</a>\n' +
    '        </li>\n' +
    '        <li>\n' +
    '          Read the\n' +
    '          <a href="https://material.io/archive/guidelines/" target="_blank"\n' +
    '             title="Material Design">Material Design </a> specifications for components,\n' +
    '          animations, styles, and layouts.\n' +
    '        </li>\n' +
    '      </ul>\n' +
    '    </p>\n' +
    '    <h2>How do I start with AngularJS Material?</h2>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        Get jump started with a free course: <a\n' +
    '          href="https://egghead.io/courses/introduction-to-angular-material" target="_blank"\n' +
    '          title="AngularJS Framework">Introduction to AngularJS Material</a>\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        Visit the <a href="https://codepen.io/team/AngularMaterial/" target="_blank"\n' +
    '                       title="CodePen Material Community">CodePen Community for AngularJS Material</a>\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        <a href="https://codepen.io/team/AngularMaterial/pen/RrbXyW" target="_blank">Start with a\n' +
    '        blank CodePen Material Application</a>\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/es6-tutorial" target="_blank"\n' +
    '             title="Material-Start Tutorial">Learn with Material-Start: 10-step Tutorial (es6)</a>\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/es6" target="_blank"\n' +
    '             title="Material Start - ES6">Learn with Material-Start: Completed (es6)</a>\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/typescript" target="_blank"\n' +
    '           title="Material Start - Typescript">Learn with Material-Start: Completed (Typescript)</a>\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        <a href="https://github.com/angular/material-start/tree/master" target="_blank"\n' +
    '           title="Material-Start - ES5">Learn with Material-Start: Completed (es5)</a>\n' +
    '      </li>\n' +
    '      <li style="margin-bottom: 30px;">\n' +
    '        <a href="https://github.com/angular/material-start" target="_blank"\n' +
    '           title="GitHub Starter Project">Use the Github Starter Project</a>\n' +
    '      </li>\n' +
    '      <li>Use the "Edit on CodePen" button on any of our Demos<br/>\n' +
    '        <img\n' +
    '            src="https://cloud.githubusercontent.com/assets/210413/11568997/ed86795a-99b4-11e5-898e-1da172be80da.png"\n' +
    '            style="width:75%;margin: 10px 30px 0 0" alt="Image with arrow to Edit on CodePen button">\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <h3>Build a Material Application (blank shell)</h3>\n' +
    '\n' +
    '    <p>\n' +
    '      See this example application on CodePen that loads\n' +
    '      the AngularJS Material library from the Google CDN:\n' +
    '    </p>\n' +
    '\n' +
    '    <iframe height=\'777\' scrolling=\'no\' title="AngularJS Material - Blank Starter"\n' +
    '            src=\'https://codepen.io/team/AngularMaterial/embed/RrbXyW/?height=777&theme-id=21180&default-tab=html\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>\n' +
    '      See the Pen <a\n' +
    '        href=\'https://codepen.io/team/AngularMaterial/pen/RrbXyW/\'>AngularJS Material - Blank\n' +
    '      Starter</a> by AngularJS\n' +
    '      Material (<a href=\'https://codepen.io/AngularMaterial\'>@AngularMaterial</a>) on <a\n' +
    '        href=\'https://codepen.io\'>CodePen</a>.\n' +
    '    </iframe>\n' +
    '\n' +
    '    <p>\n' +
    '      Now just your add your AngularJS Material components and other HTML content to your Blank\n' +
    '      starter app.\n' +
    '    </p>\n' +
    '\n' +
    '    <br/>\n' +
    '\n' +
    '    <hr>\n' +
    '\n' +
    '    <h3>Our CodePen Community</h3>\n' +
    '    <p>\n' +
    '      You can also visit our\n' +
    '      <a href="https://codepen.io/team/AngularMaterial/" target="_blank"\n' +
    '         title="Codepen Community">CodePen Community</a> to explore more\n' +
    '      <a href="https://codepen.io/team/AngularMaterial/pens/public/" target="_blank">samples</a>,\n' +
    '      <a href="https://codepen.io/team/AngularMaterial/collections/public/" target="_blank">Collections</a>, and ideas.\n' +
    '    </p>\n' +
    '    <div layout-align="center" style="width: 100%">\n' +
    '      <iframe height=\'777\' scrolling=\'no\' title="Our CodePen Community"\n' +
    '            src=\'https://codepen.io/collection/XExqGz/\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>\n' +
    '      </iframe>\n' +
    '    </div>\n' +
    '\n' +
    '\n' +
    '    <br/><br/>\n' +
    '    <hr>\n' +
    '\n' +
    '    <h3>Installing the AngularJS Material Libraries</h3>\n' +
    '\n' +
    '    <p>\n' +
    '      You can install the AngularJS Material library (and its dependent libraries) in your local\n' +
    '      project using either\n' +
    '      <a href="https://github.com/angular/bower-material/#installing-angularjs-material"\n' +
    '         target="_blank">NPM, JSPM, or Bower</a>.\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      AngularJS Material also integrates with some additional, optional libraries which you may elect\n' +
    '      to include:\n' +
    '    </p>\n' +
    '\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngMessages">ngMessages</a>\n' +
    '        - Provides a consistent mechanism for displaying form errors and other messages.\n' +
    '          <b>Required</b> for some AngularJS Material components like <code>md-input</code>.\n' +
    '      </li>\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngSanitize">ngSanitize</a>\n' +
    '        - The ngSanitize module provides functionality to sanitize HTML content in Material\n' +
    '        components.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngRoute">ngRoute</a>\n' +
    '        - Provides a clean routing system for your application.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <br/>\n' +
    '    <hr>\n' +
    '\n' +
    '    <h3>Unsupported Integrations</h3>\n' +
    '    <p>\n' +
    '      AngularJS Material has known integration issues with the following libraries:\n' +
    '    </p>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        <a href="https://docs.angularjs.org/api/ngTouch">ngTouch</a>\n' +
    '        - AngularJS Material conflicts with ngTouch for click, tap, and swipe support on touch-enabled\n' +
    '        devices.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        <a href="http://legacy.docs.ionic.io/v1.0">Ionic v1</a>\n' +
    '        - Has built-in touch support that interferes with AngularJS Material\'s mobile gesture features.\n' +
    '          Ionic v1 is no longer officially supported by the Ionic team.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2>Contributing to AngularJS Material</h2>\n' +
    '    <ul style="margin-bottom: 2em;">\n' +
    '      <li>\n' +
    '        Please read our <a href="https://github.com/angular/material#contributing">contributor\n' +
    '        guidelines</a>.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        To contribute, fork our GitHub <a href="https://github.com/angular/material">repository</a>.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        For bug reports,\n' +
    '        <a href="https://github.com/angular/material/issues?q=is%3Aissue+is%3Aopen"\n' +
    '           target="_blank">search the GitHub Issues</a> and/or\n' +
    '        <a href="https://github.com/angular/material/issues/new"\n' +
    '           target="_blank">create a New Issue</a>.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>For questions and troubleshooting,\n' +
    '        <a href="https://groups.google.com/forum/#!forum/ngmaterial"\n' +
    '           target="_blank">search the Forum</a> and/or\n' +
    '        <a href="https://groups.google.com/forum/#!newtopic/ngmaterial">post a New Question</a>.\n' +
    '      </li>\n' +
    '\n' +
    '      <li>\n' +
    '        Join the <a href="https://gitter.im/angular/material" target="_blank">Gitter Chat</a>.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '  </md-content>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/home.tmpl.html',
    '<div ng-controller="HomeCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <h2 class="md-headline" style="margin-top: 0;">What is AngularJS Material?</h2>\n' +
    '    <p>\n' +
    '      AngularJS Material is an implementation of Google\'s\n' +
    '      <a href="https://material.io/archive/guidelines/" target="_blank" rel="noopener">\n' +
    '        Material Design Specification (2014-2017)</a>.\n' +
    '      This project provides a set of reusable, well-tested, and accessible UI components for\n' +
    '      <a href="https://angularjs.org" target="_blank" rel="noopener">AngularJS</a> developers.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="50" flex-gt-md="25" ng-repeat="(index, link) in [\n' +
    '        { href: \'./getting-started\', icon: \'school\', text: \'Getting Started\' },\n' +
    '        { href: \'./contributors\', icon: \'school\', text: \'Contributors\' },\n' +
    '        { href: \'./demo\', icon: \'play_circle_fill\', text: \'Demos\' },\n' +
    '        { href: \'./CSS/typography\', icon: \'build\', text: \'Customization\' },\n' +
    '        { href: \'./api\', icon: \'code\', text: \'API Reference\' }\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            ng-href="{{link.href}}"\n' +
    '            aria-label="{{link.text}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.text}}\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <h2 class="md-headline">AngularJS versus Angular?</h2>\n' +
    '    <p>\n' +
    '      The AngularJS Material library is a mature and stable product that is ready for production use.\n' +
    '      Developers should note that AngularJS Material works only with\n' +
    '      <a href="https://angularjs.org/" target="_blank" rel="noopener">AngularJS 1.x</a>.\n' +
    '    </p>\n' +
    '    <ul>\n' +
    '      <li>\n' +
    '        Current development efforts are focused on bug fixes, accessibility, performance, and minor\n' +
    '        enhancements.\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '    <br/>\n' +
    '    <i>\n' +
    '      The Angular Material and Component Dev Kit (CDK) libraries (for Angular v2+) can be found in the\n' +
    '      <a href="https://github.com/angular/components" target="_blank" rel="noopener">angular/components</a>\n' +
    '      GitHub repository.\n' +
    '    </i>\n' +
    '    <br/>\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">The Latest Material Design</h2>\n' +
    '    <p>\n' +
    '      The latest update to Material Design\n' +
    '      (<a href="https://www.youtube.com/playlist?list=PLJ21zHI2TNh-rX-Xr_xi9KIEcbdee_1Ah" target="_blank" rel="noopener">video playlist</a>)\n' +
    '      was announced at Google I/O in May, 2018\n' +
    '      (<a href="https://design.google/library/io-2018-our-definitive-guide-design/" target="_blank" rel="noopener">recap blog post</a>).\n' +
    '      For an implementation of this new\n' +
    '      <a href="https://material.io/design" target="_blank" rel="noopener">Material Design Specification</a>,\n' +
    '      please see the <a href="https://github.com/angular/components" target="_blank" rel="noopener">Angular Material</a>\n' +
    '      project which is built for <a href="https://angular.io" target="_blank" rel="noopener">Angular</a>\n' +
    '      developers.\n' +
    '    </p>\n' +
    '\n' +
    '    <h2 class="md-headline">Change Log</h2>\n' +
    '    <p>\n' +
    '      Please refer to our changelog for up-to-date listings of all v1.x improvements and breaking changes.\n' +
    '    </p>\n' +
    '     <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        {\n' +
    '          href: \'https://github.com/angular/material/blob/master/CHANGELOG.md\',\n' +
    '          icon: \'access_time\',\n' +
    '          text: \'Changelog\'\n' +
    '        }\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            ng-href="{{link.href}}"\n' +
    '            aria-label="{{link.text}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.text}}<br/>\n' +
    '          <div style="text-transform: none;margin-top:-15px;font-size:1.0em;">AngularJS Material v1.x </div>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <h2 class="md-headline">Browser Support</h2>\n' +
    '    <p>\n' +
    '      AngularJS Material generally supports browsers that fall into these categories\n' +
    '    </p>\n' +
    '    <ul>\n' +
    '      <li>Greater than 0.5% global usage</li>\n' +
    '      <li>Last two versions of Evergreen browsers</li>\n' +
    '      <li>Firefox ESR</li>\n' +
    '      <li>Not considered "dead" browsers</li>\n' +
    '    </ul>\n' +
    '    <br/>\n' +
    '    <h3>The following table provides a more detailed view:</h3>\n' +
    '    <table class="custom-table">\n' +
    '      <tbody>\n' +
    '      <tr>\n' +
    '        <th>\n' +
    '          Browser\n' +
    '        </th>\n' +
    '        <th>\n' +
    '          Supported Versions\n' +
    '        </th>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          Chrome<br/>Chrome for Android<br/>Edge<br/>Opera\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          last 2 versions\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          Firefox\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          last 2 versions<br/>ESR\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          IE<br/>IE Mobile\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          11\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          Safari\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          11.x<br>12.x\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          iOS\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          11.x<br>12.x\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          Firefox for Android<br/>UC<br/>QQ<br/>Baidu\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          latest version\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          Android Browser\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          4.4.3-4.4.4<br>latest version\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          Samsung Internet\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          4<br>6.2<br>7.2\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>\n' +
    '          Opera for Android\n' +
    '        </td>\n' +
    '        <td>\n' +
    '          Mini all\n' +
    '        </td>\n' +
    '      </tr>\n' +
    '      </tbody>\n' +
    '    </table>\n' +
    '\n' +
    '    <md-divider></md-divider>\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">Training Videos:</h2>\n' +
    '    <p>\n' +
    '      Here are some video courses that will help jump start your development with AngularJS Material.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        { href: \'https://egghead.io/series/angular-material-introduction\', icon: \'ondemand_video\', text: \'Introduction to AngularJS Material\', site : \'EggHead\', access : \'free\'},\n' +
    '        { href: \'https://app.pluralsight.com/player?author=ajden-towfeek&name=angular-material-fundamentals-m0&mode=live&clip=0&course=angular-material-fundamentals\', icon: \'ondemand_video\', text: \'AngularJS Material Fundamentals\', site : \'Pluralsight\', access: \'member\'}\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            target="_blank"\n' +
    '            aria-label="{{link.text}}"\n' +
    '            ng-href="{{link.href}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.site}} | <span class="training_link">{{link.text}}</span> | <span class="training_info">{{link.access}}</span>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">Conference Presentations:</h2>\n' +
    '    <p>\n' +
    '      Here are some conference presentations that will provide overviews for your development with AngularJS Material.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        { href: \'https://www.youtube.com/watch?v=Qi31oO5u33U\', icon: \'ondemand_video\', text: \'Building with AngularJS Material\', site : \'ng-conf\',  date: \'2015\'},\n' +
    '        { href: \'https://www.youtube.com/watch?v=363o4i0rdvU\', icon: \'ondemand_video\', text: \'AngularJS Material in Practice\', site : \'AngularConnect\', date:\'2015\'}\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            target="_blank"\n' +
    '            aria-label="{{link.text}}"\n' +
    '            ng-href="{{link.href}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          <span class="training_site">{{link.site}}</span> | <span class="training_link">{{link.text}}</span> | <span class="training_info">{{link.date}}</span>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '\n' +
    '    <br/>\n' +
    '    <h2 class="md-headline">Google\'s Material Design</h2>\n' +
    '    <p>\n' +
    '      Material Design is a specification for a unified system of visual, motion, and interaction\n' +
    '      design that adapts across different devices and different screen sizes.\n' +
    '    </p>\n' +
    '    <ul class="buckets" layout layout-align="center center" layout-wrap>\n' +
    '      <li flex="100" flex-gt-xs="50" ng-repeat="(index, link) in [\n' +
    '        { href: \'https://www.youtube.com/watch?v=Q8TXgCzxEnw\', icon: \'ondemand_video\', text: \'Watch a video\', site : \'Google\' },\n' +
    '        { href: \'https://material.io/archive/guidelines/\', icon: \'launch\', text: \'Learn More\', site : \'Google\' }\n' +
    '      ]">\n' +
    '        <md-button\n' +
    '            class="md-primary md-raised"\n' +
    '            target="_blank"\n' +
    '            aria-label="{{link.text}}"\n' +
    '            ng-href="{{link.href}}">\n' +
    '          <md-icon class="block" md-svg-src="img/icons/ic_{{link.icon}}_24px.svg"></md-icon>\n' +
    '          {{link.site}} | <span class="training_link"> {{link.text}} </span>\n' +
    '        </md-button>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '\n' +
    '    <br/>\n' +
    '    <p class="md-caption" style="text-align: center; margin-bottom: 0;">\n' +
    '      These docs were generated from\n' +
    '      (<a ng-href="{{BUILDCONFIG.repository}}/{{menu.version.current.github}}" target="_blank"\n' +
    '          rel="noopener">v{{BUILDCONFIG.version}} - SHA {{BUILDCONFIG.commit.substring(0,7)}}</a>)\n' +
    '      on (<strong>{{BUILDCONFIG.date}}</strong>) GMT.\n' +
    '    </p>\n' +
    '  </md-content>\n' +
    '</div>\n' +
    '\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-alignment.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <p>\n' +
    '    The <code>layout-align</code> directive takes two words.\n' +
    '    The first word says how the children will be aligned in the layout\'s direction, and the second word says how the children will be aligned perpendicular to the layout\'s direction.</p>\n' +
    '\n' +
    '    <p>Only one value is required for this directive.\n' +
    '    For example, <code>layout="row" layout-align="center"</code> would make the elements\n' +
    '    center horizontally and use the default behavior vertically.</p>\n' +
    '\n' +
    '    <p><code>layout="column" layout-align="center end"</code> would make\n' +
    '    children align along the center vertically and along the end (right) horizontally. </p>\n' +
    '\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '         <thead>\n' +
    '           <tr>\n' +
    '             <th>API</th>\n' +
    '             <th>Sets child alignments within the layout container</th>\n' +
    '           </tr>\n' +
    '         </thead>\n' +
    '          <tr>\n' +
    '            <td>layout-align</td>\n' +
    '            <td>Sets default alignment unless overridden by another breakpoint.</td>\n' +
    '          </tr>\n' +
    '          <tr>\n' +
    '           <td>layout-align-xs</td>\n' +
    '           <td>width &lt; <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-xs</td>\n' +
    '           <td>width &gt;= <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-sm</td>\n' +
    '           <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-sm</td>\n' +
    '           <td>width &gt;= <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-md</td>\n' +
    '           <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-md</td>\n' +
    '           <td>width &gt;= <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-lg</td>\n' +
    '           <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-gt-lg</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>layout-align-xl</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '        </table>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <p>\n' +
    '   Below is an interactive demo that lets you explore the visual results of the different settings:\n' +
    '  </p>\n' +
    '\n' +
    '  <div>\n' +
    '    <docs-demo demo-title=\'layout="{{layoutDemo.direction}}" &nbsp; &nbsp; &nbsp; layout-align="{{layoutAlign()}}"\'\n' +
    '               class="small-demo colorNested" interpolate-code="true">\n' +
    '      <demo-file name="index.html">\n' +
    '        <div layout="{{layoutDemo.direction}}" layout-align="{{layoutAlign()}}">\n' +
    '          <div>one</div>\n' +
    '          <div>two</div>\n' +
    '          <div>three</div>\n' +
    '        </div>\n' +
    '      </demo-file>\n' +
    '    </docs-demo>\n' +
    '  </div>\n' +
    '\n' +
    '  <div layout="column" layout-gt-sm="row" layout-align="space-around">\n' +
    '\n' +
    '    <div>\n' +
    '      <md-subheader>Layout Direction</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.direction">\n' +
    '        <md-radio-button value="row">row</md-radio-button>\n' +
    '        <md-radio-button value="column">column</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '    <div>\n' +
    '      <md-subheader>Alignment in Layout Direction ({{layoutDemo.direction == \'row\' ? \'horizontal\' : \'vertical\'}})</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.mainAxis">\n' +
    '        <md-radio-button value="">none</md-radio-button>\n' +
    '        <md-radio-button value="start">start (default)</md-radio-button>\n' +
    '        <md-radio-button value="center">center</md-radio-button>\n' +
    '        <md-radio-button value="end">end</md-radio-button>\n' +
    '        <md-radio-button value="space-around">space-around</md-radio-button>\n' +
    '        <md-radio-button value="space-between">space-between</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '    <div>\n' +
    '      <md-subheader>Alignment in Perpendicular Direction ({{layoutDemo.direction == \'column\' ? \'horizontal\' : \'vertical\'}})</md-subheader>\n' +
    '      <md-radio-group ng-model="layoutDemo.crossAxis">\n' +
    '        <md-radio-button value="none"><em>none</em></md-radio-button>\n' +
    '        <md-radio-button value="start">start</md-radio-button>\n' +
    '        <md-radio-button value="center">center</md-radio-button>\n' +
    '        <md-radio-button value="end">end</md-radio-button>\n' +
    '        <md-radio-button value="stretch">stretch (default)</md-radio-button>\n' +
    '      </md-radio-group>\n' +
    '    </div>\n' +
    '\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-children.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <h3>Children within a Layout Container</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    To customize the size and position of elements in a layout <b>container</b>, use the\n' +
    '    <code>flex</code>, <code>flex-order</code>, and <code>flex-offset</code> attributes on the\n' +
    '    container\'s <b>child</b> elements:\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex="20">\n' +
    '          [flex="20"]\n' +
    '        </div>\n' +
    '        <div flex="70">\n' +
    '          [flex="70"]\n' +
    '        </div>\n' +
    '        <div flex hide-sm hide-xs>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    Add the <code>flex</code> directive to a layout\'s child element and the element will flex\n' +
    '    (grow or shrink) to fit the area unused by other elements. <code>flex</code> defines how the\n' +
    '    element will adjust its size with respect to its <b>parent</b> container and the other elements\n' +
    '    within the container.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex Percent Values" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="30">\n' +
    '          [flex="30"]\n' +
    '        </div>\n' +
    '        <div flex="45">\n' +
    '          [flex="45"]\n' +
    '        </div>\n' +
    '        <div flex="25">\n' +
    '          [flex="25"]\n' +
    '        </div>\n' +
    '        <div flex="33">\n' +
    '          [flex="33"]\n' +
    '        </div>\n' +
    '        <div flex="66">\n' +
    '          [flex="66"]\n' +
    '        </div>\n' +
    '        <div flex="50">\n' +
    '          [flex="50"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    A layout child\'s <code>flex</code> directive can be given an integer value from 0-100.\n' +
    '    The element will stretch to the percentage of available space matching the value. Currently, the <code>flex</code>\n' +
    '    directive value is restricted to multiples of five, 33 or 66.\n' +
    '  </p>\n' +
    '\n' +
    '  <p> For example: <code>flex="5", flex="20", flex="33", flex="50", flex="66", flex="75", ... flex="100"</code>.</p>\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Flex Directives" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex-gt-sm="66" flex="33">\n' +
    '          flex 33% on mobile, <br/>and 66% on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div flex-gt-sm="33" flex="66">\n' +
    '          flex 66% on mobile, <br/>and 33% on gt-sm devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    You can specify multiple <code>flex</code> directives on the same element in order to create\n' +
    '    flexible responsive behaviors across device sizes.\n' +
    '  </p>\n' +
    '  <p>\n' +
    '    Please take care not to overlap these directives, for example:\n' +
    '    <code>flex="100" flex-md="50" flex-gt-sm="25"</code>. In this example, there are two directives\n' +
    '    that apply to "medium" devices (<code>50</code> and <code>25</code>).\n' +
    '  </p>\n' +
    '  <p>\n' +
    '    The below example demonstrates how to use multiple <code>flex</code> directives overrides to\n' +
    '    achieve a desirable outcome:\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Overriding Responsive Flex Directives" class="colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="100" flex-gt-sm="33">\n' +
    '          flex 100% on mobile, <br/>and 33% on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div flex="100" flex-gt-sm="66">\n' +
    '          flex 100% on mobile, <br/>and 66% on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div flex="100" flex-md="50" flex-gt-md="25">\n' +
    '          flex 100% on mobile, 50% on md, and 25% on gt-md devices.\n' +
    '        </div>\n' +
    '        <div flex="100" flex-md="50" flex-gt-md="25">\n' +
    '          flex 100% on mobile, 50% on md, and 25% on gt-md devices.\n' +
    '        </div>\n' +
    '        <div flex="100" flex-md="50" flex-gt-md="25">\n' +
    '          flex 100% on mobile, 50% on md, and 25% on gt-md devices.\n' +
    '        </div>\n' +
    '        <div flex="100" flex-md="50" flex-gt-md="25">\n' +
    '          flex 100% on mobile, 50% on md, and 25% on gt-md devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    When a responsive layout directive like <code>layout-gt-sm</code> is active, any flex directives\n' +
    '    within that layout, that you want applied, should be active at the same time. This means that\n' +
    '    the flex directives that match up with <code>layout-gt-sm</code> would be\n' +
    '    <code>flex-gt-sm</code> and not just <code>flex</code>.\n' +
    '  </p>\n' +
    '  <p>\n' +
    '    This example demonstrates what happens when the proper flex suffix is omitted. In this case, the\n' +
    '    <code>flex="66"</code> directive is interpreted in context of the <code>layout="column"</code>\n' +
    '    layout. This is most likely not desirable.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Incorrect use of Flex Directives within Responsive Layouts"\n' +
    '             class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="column" layout-gt-sm="row">\n' +
    '        <!-- In order to work within a layout-gt-sm, the flex directive needs to match.\n' +
    '             flex-gt-sm="33" will work when layout-gt-sm="row" is active, but flex="33" would\n' +
    '              only apply when layout="column" is active. -->\n' +
    '        <div flex-gt-sm="33">\n' +
    '          column layout on mobile, <br/>flex 33% on gt-sm devices.\n' +
    '        </div>\n' +
    '        <!-- In this case, we failed to use the gt-sm suffix with the flex directive,\n' +
    '             resulting in undesirable behavior. -->\n' +
    '        <div flex="66">\n' +
    '          [flex 66%]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    Here\'s the same example as above with the correct <code>flex-gt-sm="66"</code> directive:\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Use of Responsive Flex Directives within Responsive Layouts"\n' +
    '             class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="column" layout-gt-sm="row">\n' +
    '        <div flex-gt-sm="33">\n' +
    '          column layout on mobile, <br/>flex 33% on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div flex-gt-sm="66">\n' +
    '          column layout on mobile, <br/>flex 66% on gt-sm devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/options">layout options page</a> for more information on responsive flex\n' +
    '    directives like <code>hide-sm</code> and <code>layout-wrap</code> used in the above examples.\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Additional Flex Values</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    There are additional flex values provided by AngularJS Material to improve flexibility and to make the API\n' +
    '    easier to understand.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Other Flex Values" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="none">\n' +
    '          [flex="none"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '        <div flex="nogrow">\n' +
    '          [flex="nogrow"]\n' +
    '        </div>\n' +
    '        <div flex="grow">\n' +
    '          [flex="grow"]\n' +
    '        </div>\n' +
    '        <div flex="initial">\n' +
    '          [flex="initial"]\n' +
    '        </div>\n' +
    '        <div flex="auto">\n' +
    '          [flex="auto"]\n' +
    '        </div>\n' +
    '        <div flex="noshrink">\n' +
    '          [flex="noshrink"]\n' +
    '        </div>\n' +
    '        <div flex="0">\n' +
    '          [flex="0"]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <tr>\n' +
    '      <td>flex</td>\n' +
    '      <td>\n' +
    '        Will grow and shrink as needed. Starts with a size of 0%. Same as <code>flex="0"</code>.\n' +
    '        <br />\n' +
    '        <br />\n' +
    '        <b>Note:</b> There is a known bug with this attribute in IE11 when the parent container has\n' +
    '        no explicit height set. See our\n' +
    '        <a ng-href="layout/tips#layout-column-0px-ie11">Troubleshooting</a> page for more info.\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="none"</td>\n' +
    '      <td>Will not grow or shrink. Sized based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="initial"</td>\n' +
    '      <td>Will shrink as needed. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="auto"</td>\n' +
    '      <td>Will grow and shrink as needed. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="grow"</td>\n' +
    '      <td>Will grow and shrink as needed. Starts with a size of 100%. Same as <code>flex="100"</code>.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="nogrow"</td>\n' +
    '      <td>Will shrink as needed, but won\'t grow. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex="noshrink"</td>\n' +
    '      <td>Will grow as needed, but won\'t shrink. Starts with a size based on its <code>width</code> and <code>height</code> values.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Ordering HTML Elements</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Add the <code>flex-order</code> directive to a layout child to set its\n' +
    '    order position within the layout container. Any integer value from -20 to 20 is accepted.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex-Order Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex flex-order="-1">\n' +
    '          <p>[flex-order="-1"]</p>\n' +
    '        </div>\n' +
    '        <div flex flex-order="1" flex-order-gt-md="3">\n' +
    '          <p hide-gt-md>[flex-order="1"]</p>\n' +
    '          <p hide show-gt-md>[flex-order-gt-md="3"]</p>\n' +
    '        </div>\n' +
    '        <div flex flex-order="2">\n' +
    '          <p>[flex-order="2"]</p>\n' +
    '        </div>\n' +
    '        <div flex flex-order="3" flex-order-gt-md="1">\n' +
    '          <p hide-gt-md>[flex-order="3"]</p>\n' +
    '          <p hide show-gt-md>[flex-order-gt-md="1"]</p>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '      <thead>\n' +
    '        <tr>\n' +
    '          <th>API</th>\n' +
    '          <th>Device <b>width</b> when breakpoint overrides default</th>\n' +
    '        </tr>\n' +
    '      </thead>\n' +
    '       <tr>\n' +
    '         <td>flex-order</td>\n' +
    '         <td>Sets default layout order unless overridden by another breakpoint.</td>\n' +
    '       </tr>\n' +
    '    <tr>\n' +
    '        <td>flex-order-xs</td>\n' +
    '           <td>width &lt; <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-xs</td>\n' +
    '           <td>width &gt;= <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-sm</td>\n' +
    '           <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-sm</td>\n' +
    '           <td>width &gt;= <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-md</td>\n' +
    '           <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-md</td>\n' +
    '           <td>width &gt;= <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-lg</td>\n' +
    '           <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-gt-lg</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-order-xl</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '     </table>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/options">layout options page</a> for more information on directives like\n' +
    '    <code>hide</code>, <code>hide-gt-md</code>, and <code>show-gt-md</code> used in the above examples.\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Add Offsets to the Preceding HTML Elements</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Add the <code>flex-offset</code> directive to a layout child to set its\n' +
    '    offset percentage within the layout container. Values must be multiples\n' +
    '    of <code>5</code> or <code>33</code> / <code>66</code>. These offsets establish a <code>margin-left</code>\n' +
    '    with respect to the preceding element or the containers left boundary.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '      When using <code>flex-offset</code> the margin-left offset is applied... regardless of your choice of <code>flex-order</code>.\n' +
    '      or if you use a <code>flex-direction: reverse</code>.\n' +
    '    </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Flex-Offset Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div flex="66" flex-offset="15">\n' +
    '          [flex-offset="15"]\n' +
    '          [flex="66"]\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          [flex]\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '        <thead>\n' +
    '          <tr>\n' +
    '            <th>API</th>\n' +
    '            <th>Device width when breakpoint overrides default</th>\n' +
    '          </tr>\n' +
    '        </thead>\n' +
    '         <tr>\n' +
    '           <td>flex-offset</td>\n' +
    '           <td>Sets default margin-left offset (<b>%-based</b>) unless overridden by another breakpoint.</td>\n' +
    '         </tr>\n' +
    '    <tr>\n' +
    '           <td>flex-offset-xs</td>\n' +
    '           <td>width &lt; <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-xs</td>\n' +
    '           <td>width &gt;= <b>600</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-sm</td>\n' +
    '           <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-sm</td>\n' +
    '           <td>width &gt;= <b>960</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-md</td>\n' +
    '           <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-md</td>\n' +
    '           <td>width &gt;= <b>1280</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-lg</td>\n' +
    '           <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-gt-lg</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '         <tr>\n' +
    '           <td>flex-offset-xl</td>\n' +
    '           <td>width &gt;= <b>1920</b>px</td>\n' +
    '         </tr>\n' +
    '       </table>\n' +
    '\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-container.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <h3>Layout and Containers</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Use the <code>layout</code> directive on a container element to specify the layout direction for its children:\n' +
    '    horizontally in a row (<code>layout="row"</code>) or vertically in a column (<code>layout="column"</code>).\n' +
    '    Note that <code>row</code> is the default layout direction if you specify the <code>layout</code> directive without a value.\n' +
    '  </p>\n' +
    '\n' +
    '  <table>\n' +
    '    <tr>\n' +
    '      <td style="font-weight: bold; background-color: #DBEEF5">row</td>\n' +
    '      <td style="padding-left: 10px;">Items arranged horizontally. <code>max-height = 100%</code> and <code>max-width</code>  is the width of the items in the container.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td style="font-weight: bold; background-color: #DBEEF5 ">column</td>\n' +
    '      <td style="padding-left: 10px;">Items arranged vertically. <code>max-width = 100%</code>  and <code>max-height</code> is the height of the items in the container.</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <docs-demo demo-title="Layout Directive" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '    <div layout="row">\n' +
    '      <div flex>First item in row</div>\n' +
    '      <div flex>Second item in row</div>\n' +
    '    </div>\n' +
    '    <div layout="column">\n' +
    '      <div flex>First item in column</div>\n' +
    '      <div flex>Second item in column</div>\n' +
    '    </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '      Note that <code>layout</code> only affects the flow direction for that container\'s <b>immediate</b> children.\n' +
    '    </p>\n' +
    '\n' +
    '  <hr>\n' +
    '\n' +
    '  <br/>\n' +
    '  <h3>Layouts and Responsive Breakpoints</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    As discussed in the <a href="layout/introduction">Layout Introduction page</a> you can\n' +
    '    make your layout change depending upon the device view size by using <b>breakpoint alias</b> suffixes.\n' +
    '   </p>\n' +
    '\n' +
    '  <p>\n' +
    '    To make your layout automatically change depending upon the device screen size, use one to the following <code>layout</code>\n' +
    '    APIs to set the layout direction for devices with view widths:\n' +
    '  </p>\n' +
    '\n' +
    '   <table class="md-api-table">\n' +
    '    <thead>\n' +
    '      <tr>\n' +
    '        <th>API</th>\n' +
    '        <th>Device width when breakpoint overrides default</th>\n' +
    '      </tr>\n' +
    '    </thead>\n' +
    '     <tr>\n' +
    '       <td>layout</td>\n' +
    '       <td>Sets default layout direction unless overridden by another breakpoint.</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-xs</td>\n' +
    '       <td>width &lt; <b>600</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-xs</td>\n' +
    '       <td>width &gt;= <b>600</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-sm</td>\n' +
    '       <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-sm</td>\n' +
    '       <td>width &gt;= <b>960</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-md</td>\n' +
    '       <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-md</td>\n' +
    '       <td>width &gt;= <b>1280</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-lg</td>\n' +
    '       <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-gt-lg</td>\n' +
    '       <td>width &gt;= <b>1920</b>px</td>\n' +
    '     </tr>\n' +
    '     <tr>\n' +
    '       <td>layout-xl</td>\n' +
    '       <td>width &gt;= <b>1920</b>px</td>\n' +
    '     </tr>\n' +
    '   </table>\n' +
    '   <br/>\n' +
    '\n' +
    '  <p><a\n' +
    '      href="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      target="_blank" style="text-decoration: none;border: 0 none;">\n' +
    '      <img\n' +
    '      src="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      alt=""\n' +
    '      style="max-width:100%;text-decoration: none;border: 0 none;"></a>\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    For the demo below, as you shrink your browser window width notice the flow direction changes to <code>column</code>\n' +
    '    for mobile devices (<code>xs</code>). And as you expand it will reset to <code>row</code>\n' +
    '    for <code>gt-sm</code> view sizes.\n' +
    '\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Layouts" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-xs="column">\n' +
    '        <div flex>\n' +
    '          I\'m above on mobile, and to the left on larger devices.\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          I\'m below on mobile, and to the right on larger devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/options">Layout Options page</a> for more options such as padding, alignments, etc.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '\n' +
    ' </div>\n' +
    '\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-introduction.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content" ng-cloak>\n' +
    '\n' +
    '  <h3>Overview</h3>\n' +
    '  <p>\n' +
    '    AngularJS Material\'s Layout features provide sugar to enable developers to more easily create modern,\n' +
    '    responsive layouts on top of CSS3 <a href="http://www.w3.org/TR/css3-flexbox/">flexbox</a>.\n' +
    '    The layout API consists of a set of AngularJS directives that can\n' +
    '    be applied to any of your application\'s HTML content.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    Using <b> HTML Directives</b> as the API provides an easy way to set a value (eg. <code>layout="row"</code>) and\n' +
    '    helps with separation of concerns: Attributes define layout while CSS classes assign styling.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '    <tr>\n' +
    '      <th>HTML Markup API</th>\n' +
    '      <th>Allowed values (raw or interpolated)</th>\n' +
    '    </tr>\n' +
    '    </thead>\n' +
    '    <tbody>\n' +
    '    <tr>\n' +
    '      <td>layout</td>\n' +
    '      <td><code>row | column</code></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex</td>\n' +
    '      <td> integer (increments of 5 for 0%->100%, 100%/3, 200%/3)</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-order</td>\n' +
    '      <td>integer values from -20 to 20</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>flex-offset</td>\n' +
    '      <td>integer (increments of 5 for 0%->95%, 100%/3, 200%/3)</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-align</td>\n' +
    '      <td><code>start|center|end|space-around|space-between</code> <code>start|center|end|stretch</code></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-fill</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-wrap</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-nowrap</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-margin</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-padding</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>show</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide</td>\n' +
    '      <td></td>\n' +
    '    </tr>\n' +
    '    </tbody>\n' +
    '  </table>\n' +
    '\n' +
    '\n' +
    '  <p>And if we use Breakpoints as specified in Material Design:</p>\n' +
    '  <p><a\n' +
    '      href="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      target="_blank"><img\n' +
    '      src="https://camo.githubusercontent.com/ad81ae92f8b4285747ce4e48007bf3f104dd5630/687474703a2f2f6d6174657269616c2d64657369676e2e73746f726167652e676f6f676c65617069732e636f6d2f7075626c6973682f6d6174657269616c5f765f342f6d6174657269616c5f6578745f7075626c6973682f3042386f6c5631354a3761625053474678656d46695156527462316b2f6c61796f75745f61646170746976655f627265616b706f696e74735f30312e706e67"\n' +
    '      alt="Breakpoints as specified in the Material Design Spec"\n' +
    '      style="max-width:100%;"></a>\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>We can associate breakpoints with mediaQuery definitions using breakpoint <strong>alias(es)</strong>:</p>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '    <tr>\n' +
    '      <th>Breakpoint</th>\n' +
    '      <th>MediaQuery (pixel range)</th>\n' +
    '    </tr>\n' +
    '    </thead>\n' +
    '    <tbody>\n' +
    '    <tr>\n' +
    '      <td>xs</td>\n' +
    '      <td>\'(max-width: <b>599</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-xs</td>\n' +
    '      <td>\'(min-width: <b>600</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>sm</td>\n' +
    '      <td>\'(min-width: <b>600</b>px) and (max-width: <b>959</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-sm</td>\n' +
    '      <td>\'(min-width: <b>960</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>md</td>\n' +
    '      <td>\'(min-width: <b>960</b>px) and (max-width: <b>1279</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-md</td>\n' +
    '      <td>\'(min-width: <b>1280</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>lg</td>\n' +
    '      <td>\'(min-width: <b>1280</b>px) and (max-width: <b>1919</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>gt-lg</td>\n' +
    '      <td>\'(min-width: <b>1920</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>xl</td>\n' +
    '      <td>\'(min-width: <b>1920</b>px)\'</td>\n' +
    '    </tr>\n' +
    '    </tbody>\n' +
    '  </table>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <h3>\n' +
    '    API with Responsive Breakpoints\n' +
    '  </h3>\n' +
    '\n' +
    '  <p>Now we can combine the breakpoint <code>alias</code> with the Layout API to easily support Responsive breakpoints\n' +
    '    with our simple Layout markup convention. The <code>alias</code> is simply used as <b>suffix</b> extensions to the Layout\n' +
    '    API keyword.\n' +
    '    <br/>e.g.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    This notation results in, for example, the following table for the <code>layout</code> and <code>flex</code> APIs:\n' +
    '  </p>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '      <thead>\n' +
    '      <tr>\n' +
    '        <th>layout API</th>\n' +
    '        <th>flex API</th>\n' +
    '        <th>Activates when device</th>\n' +
    '      </tr>\n' +
    '      </thead>\n' +
    '      <tr>\n' +
    '        <td>layout</td>\n' +
    '        <td>flex</td>\n' +
    '        <td>Sets default layout direction &amp; flex unless overridden by another breakpoint.</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-xs</td>\n' +
    '        <td>flex-xs</td>\n' +
    '        <td>width &lt; <b>600</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-xs</td>\n' +
    '        <td>flex-gt-xs</td>\n' +
    '        <td>width &gt;= <b>600</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-sm</td>\n' +
    '        <td>flex-sm</td>\n' +
    '        <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-sm</td>\n' +
    '        <td>flex-gt-sm</td>\n' +
    '        <td>width &gt;= <b>960</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-md</td>\n' +
    '        <td>flex-md</td>\n' +
    '        <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-md</td>\n' +
    '        <td>flex-gt-md</td>\n' +
    '        <td>width &gt;= <b>1280</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-lg</td>\n' +
    '        <td>flex-lg</td>\n' +
    '        <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-gt-lg</td>\n' +
    '        <td>flex-gt-lg</td>\n' +
    '        <td>width &gt;= <b>1920</b>px</td>\n' +
    '      </tr>\n' +
    '      <tr>\n' +
    '        <td>layout-xl</td>\n' +
    '        <td>flex-xl</td>\n' +
    '        <td>width &gt;= <b>1920</b>px</td>\n' +
    '      </tr>\n' +
    '    </table>\n' +
    '\n' +
    '  <p>Below is an example usage of the Responsive Layout API:</p>\n' +
    '\n' +
    '  <hljs lang="html">\n' +
    '    <div layout=\'column\' class="zero">\n' +
    '\n' +
    '      <div flex="33" flex-md="{{ vm.box1Width }}" class="one"></div>\n' +
    '      <div flex="33" layout="{{ vm.direction }}" layout-md="row" class="two">\n' +
    '\n' +
    '        <div flex="20" flex-md="10" hide-lg class="two_one"></div>\n' +
    '        <div flex="30px" show hide-md="{{ vm.hideBox }}" flex-md="25" class="two_two"></div>\n' +
    '        <div flex="20" flex-md="65" class="two_three"></div>\n' +
    '\n' +
    '      </div>\n' +
    '      <div flex class="three"></div>\n' +
    '\n' +
    '    </div>\n' +
    '  </hljs>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <p>\n' +
    '  This Layout API means it is much easier to set up and maintain flexbox layouts vs. defining everything via CSS.\n' +
    '  The developer uses the Layout HTML API to specify <b><i>intention</i></b> and the Layout engine handles all the issues of CSS flexbox styling.\n' +
    '  </p>\n' +
    '\n' +
    '  <p class="layout_note">\n' +
    '    The Layout engine will log console warnings when it encounters conflicts or known issues.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <br/><br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Under-the-Hood</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Due to performance problems when using Attribute Selectors with <b>Internet Explorer</b> browsers; see the following for more details:\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    Layout directives dynamically generate class selectors at runtime. And the Layout CSS classNames and styles have each been\n' +
    '    predefined in the <code>angular-material.css</code> stylesheet.\n' +
    '  </p>\n' +
    '\n' +
    '  <p class="layout_note">\n' +
    '    Developers should continue to use Layout directives in the HTML\n' +
    '    markup as the classes may change between releases.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    Let\'s see how this directive-to-className transformation works. Consider the simple use of the <code>layout</code> and <code>flex</code> directives (API):\n' +
    '  </p>\n' +
    '\n' +
    '  <hljs lang="html">\n' +
    '    <div>\n' +
    '\n' +
    '      <div layout="row">\n' +
    '\n' +
    '        <div flex>First item in row</div>\n' +
    '        <div flex="20">Second item in row</div>\n' +
    '\n' +
    '      </div>\n' +
    '      <div layout="column">\n' +
    '\n' +
    '        <div flex="66">First item in column</div>\n' +
    '        <div flex="33">Second item in column</div>\n' +
    '\n' +
    '      </div>\n' +
    '\n' +
    '    </div>\n' +
    '  </hljs>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    At runtime, these attributes are transformed to CSS classes.\n' +
    '  </p>\n' +
    '\n' +
    '  <hljs lang="html">\n' +
    '    <div>\n' +
    '\n' +
    '      <div class="ng-scope layout-row">\n' +
    '\n' +
    '        <div class="flex">First item in row</div>\n' +
    '        <div class="flex-20">Second item in row</div>\n' +
    '\n' +
    '      </div>\n' +
    '      <div class="ng-scope layout-column">\n' +
    '\n' +
    '        <div class="flex-33">First item in column</div>\n' +
    '        <div class="flex-66">Second item in column</div>\n' +
    '\n' +
    '      </div>\n' +
    '\n' +
    '    </div>\n' +
    '  </hljs>\n' +
    '\n' +
    '  <p>\n' +
    '    Using the style classes above defined in <code>angular-material.css</code>\n' +
    '  </p>\n' +
    '\n' +
    '  <hljs lang="css">\n' +
    '\n' +
    '    .flex {\n' +
    '      -webkit-flex: 1 1 0%;\n' +
    '          -ms-flex: 1 1 0%;\n' +
    '              flex: 1 1 0%;\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '    .flex-20 {\n' +
    '      -webkit-flex: 1 1 20%;\n' +
    '          -ms-flex: 1 1 20%;\n' +
    '              flex: 1 1 20%;\n' +
    '      max-width: 20%;\n' +
    '      max-height: 100%;\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '\n' +
    '    .layout-row .flex-33 {\n' +
    '      -webkit-flex: 1 1 calc(100% / 3);\n' +
    '          -ms-flex: 1 1 calc(100% / 3);\n' +
    '              flex: 1 1 calc(100% / 3);\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '\n' +
    '    .layout-row  .flex-66 {\n' +
    '      -webkit-flex: 1 1 calc(200% / 3);\n' +
    '          -ms-flex: 1 1 calc(200% / 3);\n' +
    '              flex: 1 1 calc(200% / 3);\n' +
    '      box-sizing: border-box;\n' +
    '    }\n' +
    '\n' +
    '\n' +
    '    .layout-row .flex-33 {\n' +
    '      max-width: calc(100% / 3);\n' +
    '      max-height: 100%;\n' +
    '    }\n' +
    '\n' +
    '    .layout-row  .flex-66 {\n' +
    '      max-width: calc(200% / 3);\n' +
    '      max-height: 100%;\n' +
    '    }\n' +
    '\n' +
    '    .layout-column .flex-33 {\n' +
    '      max-width: 100%;\n' +
    '      max-height: calc(100% / 3);\n' +
    '    }\n' +
    '\n' +
    '    .layout-column  .flex-66 {\n' +
    '      max-width: 100%;\n' +
    '      max-height: calc(200% / 3);\n' +
    '    }\n' +
    '  </hljs>\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-options.tmpl.html',
    '<div ng-controller="LayoutCtrl" class="layout-content layout-options" ng-cloak>\n' +
    '\n' +
    '  <docs-demo demo-title="Responsive Layout" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-sm="column">\n' +
    '        <div flex>\n' +
    '          I\'m above on mobile, and to the left on larger devices.\n' +
    '        </div>\n' +
    '        <div flex>\n' +
    '          I\'m below on mobile, and to the right on larger devices.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    See the <a href="layout/container">Container Elements</a> page for a basic explanation\n' +
    '    of layout directives.\n' +
    '    <br/>\n' +
    '    To make your layout change depending upon the device screen size, there are\n' +
    '    other <code>layout</code> directives available:\n' +
    '  </p>\n' +
    '\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '    <tr>\n' +
    '      <th>API</th>\n' +
    '      <th>Activates when device</th>\n' +
    '    </tr>\n' +
    '    </thead>\n' +
    '    <tr>\n' +
    '      <td>layout</td>\n' +
    '      <td>Sets default layout direction unless overridden by another breakpoint.</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-xs</td>\n' +
    '      <td>width &lt; <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-xs</td>\n' +
    '      <td>width &gt;= <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-sm</td>\n' +
    '      <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-sm</td>\n' +
    '      <td>width &gt;= <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-md</td>\n' +
    '      <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-md</td>\n' +
    '      <td>width &gt;= <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-lg</td>\n' +
    '      <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-gt-lg</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>layout-xl</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '  <br/>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr>\n' +
    '  <br/>\n' +
    '\n' +
    '  <h3>Layout Margin, Padding, Wrap and Fill</h3>\n' +
    '  <br/>\n' +
    '\n' +
    '\n' +
    '  <docs-demo demo-title="Layout Margin, Padding, and Fill" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-margin>\n' +
    '        <div flex>Parent layout and this element have margins.</div>\n' +
    '      </div>\n' +
    '      <div layout="row" layout-padding>\n' +
    '        <div flex>Parent layout and this element have padding.</div>\n' +
    '      </div>\n' +
    '      <div layout="row" layout-fill style="min-height: 224px;">\n' +
    '        <div flex>Parent layout is set to fill available space.</div>\n' +
    '      </div>\n' +
    '      <div layout="row" layout-padding layout-margin layout-fill style="min-height: 224px;">\n' +
    '        <div flex>I am using all three at once.</div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    <code>layout-margin</code> adds margin around each <code>flex</code> child. It also adds a margin to the layout\n' +
    '    container itself.\n' +
    '    <br/>\n' +
    '    <code>layout-padding</code> adds padding inside each <code>flex</code> child. It also adds padding to the layout\n' +
    '    container itself.\n' +
    '    <br/>\n' +
    '    <code>layout-fill</code> forces the layout element to fill its parent container.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <p>Here is a non-trivial group of <code>flex</code> elements using <code>layout-wrap</code></p>\n' +
    '\n' +
    '  <docs-demo demo-title="Wrap" class="small-demo colorNested-noPad">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row" layout-wrap>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="66">[flex=66]</div>\n' +
    '        <div flex="66">[flex=66]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '        <div flex="33">[flex=33]</div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    <code>layout-wrap</code> allows <code>flex</code> children to wrap within the container if the elements use more\n' +
    '    than 100%.\n' +
    '    <br/>\n' +
    '  </p>\n' +
    '\n' +
    '  <br/>\n' +
    '\n' +
    '  <br/>\n' +
    '    <hr>\n' +
    '    <br/>\n' +
    '\n' +
    '    <h3>Show &amp; Hide </h3>\n' +
    '\n' +
    '  <p>Use the <code>show</code> <code>hide</code> APIs to responsively show or hide elements. While these work similar\n' +
    '  to <code>ng-show</code> and <code>ng-hide</code>, these AngularJS Material Layout directives are mediaQuery-aware.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="Hide and Show Directives" class="small-demo colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div layout="row">\n' +
    '        <div hide show-gt-sm flex>\n' +
    '          Only show on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div hide-gt-sm flex>\n' +
    '          Shown on small and medium.<br/>\n' +
    '          Hidden on gt-sm devices.\n' +
    '        </div>\n' +
    '        <div show hide-gt-md flex>\n' +
    '          Shown on small and medium size devices.<br/>\n' +
    '          Hidden on gt-md devices.\n' +
    '        </div>\n' +
    '        <div hide show-md flex>\n' +
    '          Shown on medium size devices only.\n' +
    '        </div>\n' +
    '        <div hide show-gt-lg flex>\n' +
    '          Shown on devices larger than 1200px wide only.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '  <br/>\n' +
    '  <table class="md-api-table">\n' +
    '    <thead>\n' +
    '      <tr>\n' +
    '        <th>hide (display: none)</th>\n' +
    '        <th>show (negates hide)</th>\n' +
    '        <th>Activates when:</th>\n' +
    '      </tr>\n' +
    '    </thead>\n' +
    '    <tr>\n' +
    '      <td>hide-xs</td>\n' +
    '      <td>show-xs</td>\n' +
    '      <td>width &lt; <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-xs</td>\n' +
    '      <td>show-gt-xs</td>\n' +
    '      <td>width &gt;= <b>600</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-sm</td>\n' +
    '      <td>show-sm</td>\n' +
    '      <td><b>600</b>px &lt;= width &lt; <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-sm</td>\n' +
    '      <td>show-gt-sm</td>\n' +
    '      <td>width &gt;= <b>960</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-md</td>\n' +
    '      <td>show-md</td>\n' +
    '      <td><b>960</b>px &lt;= width &lt; <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-md</td>\n' +
    '      <td>show-gt-md</td>\n' +
    '      <td>width &gt;= <b>1280</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-lg</td>\n' +
    '      <td>show-lg</td>\n' +
    '      <td><b>1280</b>px &lt;= width &lt; <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-gt-lg</td>\n' +
    '      <td>show-gt-lg</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <td>hide-xl</td>\n' +
    '      <td>show-xl</td>\n' +
    '      <td>width &gt;= <b>1920</b>px</td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/layout-tips.tmpl.html',
    '<style>\n' +
    '  ul.spaced li {\n' +
    '    margin-bottom: 15px;\n' +
    '  }\n' +
    '</style>\n' +
    '<div ng-controller="LayoutTipsCtrl as tips" class="layout-content">\n' +
    '  <h3>Overview</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    The AngularJS Material Layout system uses the current\n' +
    '    <a href="http://www.w3.org/TR/css3-flexbox/">Flexbox</a> feature set. More importantly, it also\n' +
    '    adds syntactic sugar to allow developers to easily and quickly add Responsive features to HTML\n' +
    '    containers and elements.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    As you use the Layout features, you may encounter scenarios where the layouts do not render as\n' +
    '    expected; especially with IE 10 and 11 browsers. There may also be cases where you need to add\n' +
    '    custom HTML, CSS and Javascript to achieve your desired results.\n' +
    '  </p>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>Resources</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    If you are experiencing an issue in a particular browser, we highly recommend using the\n' +
    '    following resources for known issues and workarounds.\n' +
    '  </p>\n' +
    '\n' +
    '  <ul>\n' +
    '    <li><a href="https://github.com/philipwalton/flexbugs#flexbugs" target="_blank">FlexBugs</a></li>\n' +
    '    <li><a href="https://philipwalton.github.io/solved-by-flexbox/" target="_blank">Solved by FlexBugs</a></li>\n' +
    '    <li><a href="http://philipwalton.com/articles/normalizing-cross-browser-flexbox-bugs/" target="_blank">Normalizing Cross-browser Flexbox Bugs</a></li>\n' +
    '    <li style="margin-bottom: 20px;"><a href="http://caniuse.com/#search=flex" target="_blank">Can I use flexbox...? ( see the <code>Known Issues</code> tab)</a></li>\n' +
    '    <li><a href="https://groups.google.com/forum/#!forum/ngmaterial">AngularJS Material Forum</a></li>\n' +
    '    <li style="margin-top: 20px;"><a href="https://css-tricks.com/snippets/css/a-guide-to-flexbox/" target="_blank">A Complete Guide to Flexbox</a></li>\n' +
    '    <li style="margin-bottom: 20px;"><a href="https://scotch.io/tutorials/a-visual-guide-to-css3-flexbox-properties" target="_blank">A Visual Guide to CSS3 Flexbox Properties</a></li>\n' +
    '  </ul>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>General Tips</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Below, you will find solutions to some of the more common scenarios and problems that may arise\n' +
    '    when using Material\'s Layout system. The following sections offer general guidelines and tips when using the <code>flex</code> and\n' +
    '        <code>layout</code> directives within your own applications.\n' +
    '  </p>\n' +
    '\n' +
    '  <ul class="spaced">\n' +
    '    <li>\n' +
    '      When building your application\'s Layout, it is usually best to start with a mobile version\n' +
    '      that looks and works correctly, and then apply styling for larger devices using the\n' +
    '      <code>flex-gt-*</code> or <code>hide-gt-*</code> attributes. This approach typically leads\n' +
    '      to less frustration than starting big and attempting to fix issues on smaller devices.\n' +
    '    </li>\n' +
    '\n' +
    '    <li>\n' +
    '      Some elements like <code>&lt;fieldset&gt;</code> and <code>&lt;button&gt;</code> do not always\n' +
    '      work correctly with flex. Additionally, some of the AngularJS Material components provide their\n' +
    '      own styles. If you are having difficulty with a specific element/component, but not\n' +
    '      others, try applying the flex attributes to a parent or child <code>&lt;div&gt;</code> of the\n' +
    '      element instead.\n' +
    '    </li>\n' +
    '\n' +
    '    <li>\n' +
    '      Some Flexbox properties such as <code>flex-direction</code> <u>cannot</u> be animated.\n' +
    '    </li>\n' +
    '\n' +
    '    <li>\n' +
    '      Flexbox can behave differently on different browsers. You should test as many as possible on\n' +
    '      a regular basis so that you can catch and fix layout issues more quickly.\n' +
    '    </li>\n' +
    '  </ul>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>Layout Column</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    In some scenarios <code>layout="column"</code> and breakpoints (xs, gt-xs, xs, gt-sm, etc.) may not work\n' +
    '    as expected due to CSS specificity rules.\n' +
    '  </p>\n' +
    '\n' +
    '  <div class="md-whiteframe-3dp">\n' +
    '\n' +
    '    <iframe height=\'700\' scrolling=\'no\'\n' +
    '            src=\'//codepen.io/team/AngularMaterial/embed/obgapg/?height=700&theme-id=21180&default-tab=result\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>See the Pen <a\n' +
    '        href=\'http://codepen.io/team/AngularMaterial/pen/obgapg/\'>Card Layouts (corrected)</a> by AngularJS Material (<a\n' +
    '        href=\'http://codepen.io/AngularMaterial\'>@AngularMaterial</a>) on <a href=\'http://codepen.io\'>CodePen</a>.\n' +
    '    </iframe>\n' +
    '\n' +
    '  </div>\n' +
    '\n' +
    '    <p>\n' +
    '      This is easily fixed simply by inverting the layout logic so that the default is <code>layout=\'row\'</code>.\n' +
    '      To see how the layout changes, shrink the browser window its width is <600px;\n' +
    '    </p>\n' +
    '\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3 id="layout-column-0px-ie11">IE11 - Layout Column, 0px Height</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    In Internet Explorer 11, when you have a column layout with unspecified height and flex items\n' +
    '    inside, the browser can get confused and incorrectly calculate the height of each item (and thus\n' +
    '    the container) as <code>0px</code>, making the items overlap and not take up the proper amount\n' +
    '    of space.\n' +
    '  </p>\n' +
    '\n' +
    '  <p class="layout_note">\n' +
    '    <b>Note:</b> The flex items below actually do have some height. This is because our doc-specific\n' +
    '    CSS provides a small bit of padding (<code>8px</code>). We felt that the extra padding made for\n' +
    '    a better demo of the actual issue.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="IE11 - Layout Column, 0px Height" class="colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div flex layout="column">\n' +
    '        <div flex>\n' +
    '          11111<br />11111<br />11111\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          22222<br />22222<br />22222\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          33333<br />33333<br />33333\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <p>\n' +
    '    Unfortunately, there is no IE11 specific fix available, and the suggested workaround is to set\n' +
    '    the <code>flex-basis</code> property to <code>auto</code> instead of <code>0px</code> (which is\n' +
    '    the default setting).\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    You can easily achieve this using the <code>flex="auto"</code> attribute that the Layout system\n' +
    '    provides.\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="IE11 - Layout Column, 0px Height (Fix 1)" class="colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div flex layout="column">\n' +
    '        <div flex="auto">\n' +
    '          11111<br />11111<br />11111\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex="auto">\n' +
    '          22222<br />22222<br />22222\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex="auto">\n' +
    '          33333<br />33333<br />33333\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '\n' +
    '  <p>\n' +
    '    Alternatively, you can manually set the height of the layout container (<code>400px</code>\n' +
    '    in the demo below).\n' +
    '  </p>\n' +
    '\n' +
    '  <docs-demo demo-title="IE11 - Layout Column, 0px Height (Fix 2)" class="colorNested">\n' +
    '    <demo-file name="index.html">\n' +
    '      <div flex layout="column" style="height: 400px;">\n' +
    '        <div flex>\n' +
    '          11111<br />11111<br />11111\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          22222<br />22222<br />22222\n' +
    '        </div>\n' +
    '\n' +
    '        <div flex>\n' +
    '          33333<br />33333<br />33333\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </demo-file>\n' +
    '  </docs-demo>\n' +
    '\n' +
    '  <br/>\n' +
    '  <hr/>\n' +
    '\n' +
    '  <h3>Flex Element Heights</h3>\n' +
    '\n' +
    '  <p>\n' +
    '    Firefox currently has an issue calculating the proper height of flex containers whose children\n' +
    '    are flex, but have more content than can properly fit within the container.\n' +
    '  </p>\n' +
    '\n' +
    '  <p>\n' +
    '    This is particularly problematic if the <code>flex</code> children are <code>md-content</code> components as\n' +
    '    it will prevent the content from scrolling correctly, instead scrolling the entire body.\n' +
    '  </p>\n' +
    '\n' +
    '  <div class="md-whiteframe-3dp">\n' +
    '    <iframe height=\'376\' scrolling=\'no\'\n' +
    '            src=\'//codepen.io/team/AngularMaterial/embed/NxKBwW/?height=376&theme-id=0&default-tab=result\'\n' +
    '            frameborder=\'no\' allowtransparency=\'true\' allowfullscreen=\'true\' style=\'width: 100%;\'>\n' +
    '      See the Pen <a href=\'http://codepen.io/team/AngularMaterial/pen/NxKBwW/\'>AngularJS Material Basic App</a>\n' +
    '      by AngularJS Material (<a href=\'http://codepen.io/AngularMaterial\'>@AngularJSMaterial</a>)\n' +
    '      on <a href=\'http://codepen.io\'>CodePen</a>.\n' +
    '    </iframe>\n' +
    '  </div>\n' +
    '\n' +
    '  <p>\n' +
    '    Notice in the above Codepen how we must set <code>overflow: auto</code> on the div with the\n' +
    '    <code>change-my-css</code> class in order for Firefox to properly calculate the height and\n' +
    '    shrink to the available space.\n' +
    '  </p>\n' +
    '\n' +
    '</div>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/license.tmpl.html',
    '<div ng-controller="GuideCtrl" class="doc-content">\n' +
    '  <md-content>\n' +
    '    <p>The MIT License</p>\n' +
    '\n' +
    '    <p>\n' +
    '      Copyright (c) 2014-2018 Google LLC\n' +
    '      <a href="http://angularjs.org">https://angularjs.org</a>\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      Permission is hereby granted, free of charge, to any person obtaining a copy\n' +
    '      of this software and associated documentation files (the "Software"), to deal\n' +
    '      in the Software without restriction, including without limitation the rights\n' +
    '      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n' +
    '      copies of the Software, and to permit persons to whom the Software is\n' +
    '      furnished to do so, subject to the following conditions:\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      The above copyright notice and this permission notice shall be included in\n' +
    '      all copies or substantial portions of the Software.\n' +
    '    </p>\n' +
    '\n' +
    '    <p>\n' +
    '      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
    '      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
    '      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n' +
    '      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n' +
    '      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n' +
    '      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n' +
    '      THE SOFTWARE.\n' +
    '    </p>\n' +
    '  </md-content>\n' +
    '</div>');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/menu-link.tmpl.html',
    '<md-button\n' +
    '    ng-class="{\'active\' : isSelected()}"\n' +
    '    ng-href="{{section.url}}"\n' +
    '    ng-click="focusSection()">\n' +
    '  {{section | humanizeDoc}}\n' +
    '  <span class="md-visually-hidden"\n' +
    '    ng-if="isSelected()">\n' +
    '    current page\n' +
    '  </span>\n' +
    '</md-button>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/menu-toggle.tmpl.html',
    '<md-button class="md-button-toggle"\n' +
    '  ng-click="toggle()"\n' +
    '  aria-controls="docs-menu-{{section.name | nospace}}"\n' +
    '  aria-expanded="{{isOpen()}}">\n' +
    '  <div flex layout="row">\n' +
    '    {{section.name}}\n' +
    '    <span flex></span>\n' +
    '    <span aria-hidden="true" class="md-toggle-icon"\n' +
    '    ng-class="{\'toggled\' : isOpen()}">\n' +
    '      <md-icon md-svg-icon="md-toggle-arrow"></md-icon>\n' +
    '    </span>\n' +
    '  </div>\n' +
    '  <span class="md-visually-hidden">\n' +
    '    Toggle {{isOpen()? \'expanded\' : \'collapsed\'}}\n' +
    '  </span>\n' +
    '</md-button>\n' +
    '\n' +
    '<ul id="docs-menu-{{section.name | nospace}}"\n' +
    '  class="menu-toggle-list"\n' +
    '  aria-hidden="{{!renderContent}}"\n' +
    '  ng-style="{ visibility: renderContent ? \'visible\' : \'hidden\' }">\n' +
    '\n' +
    '  <li ng-repeat="page in section.pages">\n' +
    '    <menu-link section="page"></menu-link>\n' +
    '  </li>\n' +
    '</ul>\n' +
    '');
}]);

angular.module('docsApp').run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/view-source.tmpl.html',
    '<md-dialog class="view-source-dialog">\n' +
    '\n' +
    '  <md-tabs>\n' +
    '    <md-tab ng-repeat="file in files"\n' +
    '                  active="file === data.selectedFile"\n' +
    '                  ng-click="data.selectedFile = file" >\n' +
    '        <span class="window_label">{{file.viewType}}</span>\n' +
    '    </md-tab>\n' +
    '  </md-tabs>\n' +
    '\n' +
    '  <md-dialog-content md-scroll-y flex>\n' +
    '    <div ng-repeat="file in files">\n' +
    '      <hljs code="file.content"\n' +
    '        lang="{{file.fileType}}"\n' +
    '        ng-show="file === data.selectedFile" >\n' +
    '      </hljs>\n' +
    '    </div>\n' +
    '  </md-dialog-content>\n' +
    '\n' +
    '  <md-dialog-actions layout="horizontal">\n' +
    '    <md-button class="md-primary" ng-click="$hideDialog()">\n' +
    '      Done\n' +
    '    </md-button>\n' +
    '  </md-dialog-actions>\n' +
    '</md-dialog>\n' +
    '');
}]);

angular.module('docsApp')
.directive('hljs', ['$timeout', '$q', '$interpolate', function($timeout, $q, $interpolate) {
  return {
    restrict: 'E',
    compile: function(element, attr) {
      var code;
      // No attribute? code is the content
      if (!attr.code) {
        code = element.html();
        element.empty();
      }

      return function(scope, element, attr) {

        if (attr.code) {
          // Attribute? code is the evaluation
          code = scope.$eval(attr.code);
        }
        var shouldInterpolate = scope.$eval(attr.shouldInterpolate);

        $q.when(code).then(function(code) {
          if (code) {
            if (shouldInterpolate) {
              code = $interpolate(code)(scope);
            }
            var contentParent = angular.element(
              '<pre><code class="highlight" ng-non-bindable></code></pre>'
            );
            element.append(contentParent);
            // Defer highlighting 1-frame to prevent GA interference...
            $timeout(function() {
              render(code, contentParent);
            }, 34, false);
          }
        });

        function render(contents, parent) {
          var codeElement = parent.find('code');

          // Strip excessive newlines and the leading/trailing newline (otherwise the whitespace
          // calculations below are not correct).
          var strippedContents = contents.replace(/\n{2,}/g, '\n\n').replace(/^\n/, '').replace(/\n$/, '');
          var lines = strippedContents.split('\n');

          // Make it so each line starts at 0 whitespace
          var firstLineWhitespace = lines[0].match(/^\s*/)[0];
          var startingWhitespaceRegex = new RegExp('^' + firstLineWhitespace);
          lines = lines.map(function(line) {
            return line
              .replace(startingWhitespaceRegex, '')
              .replace(/\s+$/, '');
          });

          var highlightedCode = hljs.highlight(attr.language || attr.lang, lines.join('\n'), true);
          highlightedCode.value = highlightedCode.value
            .replace(/=<span class="hljs-value">""<\/span>/gi, '')
            .replace('<head>', '')
            .replace('<head/>', '');
          codeElement.append(highlightedCode.value).addClass('highlight');
        }
      };
    }
  };
}]);

/*! highlight.js v9.15.6 | BSD3 License | git.io/hljslicense */
!function(e){var n="object"==typeof window&&window||"object"==typeof self&&self;"undefined"!=typeof exports?e(exports):n&&(n.hljs=e({}),"function"==typeof define&&define.amd&&define([],function(){return n.hljs}))}(function(a){var E=[],u=Object.keys,N={},g={},n=/^(no-?highlight|plain|text)$/i,R=/\blang(?:uage)?-([\w-]+)\b/i,t=/((^(<[^>]+>|\t|)+|(?:\n)))/gm,r={case_insensitive:"cI",lexemes:"l",contains:"c",keywords:"k",subLanguage:"sL",className:"cN",begin:"b",beginKeywords:"bK",end:"e",endsWithParent:"eW",illegal:"i",excludeBegin:"eB",excludeEnd:"eE",returnBegin:"rB",returnEnd:"rE",relevance:"r",variants:"v",IDENT_RE:"IR",UNDERSCORE_IDENT_RE:"UIR",NUMBER_RE:"NR",C_NUMBER_RE:"CNR",BINARY_NUMBER_RE:"BNR",RE_STARTERS_RE:"RSR",BACKSLASH_ESCAPE:"BE",APOS_STRING_MODE:"ASM",QUOTE_STRING_MODE:"QSM",PHRASAL_WORDS_MODE:"PWM",C_LINE_COMMENT_MODE:"CLCM",C_BLOCK_COMMENT_MODE:"CBCM",HASH_COMMENT_MODE:"HCM",NUMBER_MODE:"NM",C_NUMBER_MODE:"CNM",BINARY_NUMBER_MODE:"BNM",CSS_NUMBER_MODE:"CSSNM",REGEXP_MODE:"RM",TITLE_MODE:"TM",UNDERSCORE_TITLE_MODE:"UTM",COMMENT:"C",beginRe:"bR",endRe:"eR",illegalRe:"iR",lexemesRe:"lR",terminators:"t",terminator_end:"tE"},b="</span>",h={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0};function _(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function d(e){return e.nodeName.toLowerCase()}function v(e,n){var t=e&&e.exec(n);return t&&0===t.index}function p(e){return n.test(e)}function l(e){var n,t={},r=Array.prototype.slice.call(arguments,1);for(n in e)t[n]=e[n];return r.forEach(function(e){for(n in e)t[n]=e[n]}),t}function M(e){var a=[];return function e(n,t){for(var r=n.firstChild;r;r=r.nextSibling)3===r.nodeType?t+=r.nodeValue.length:1===r.nodeType&&(a.push({event:"start",offset:t,node:r}),t=e(r,t),d(r).match(/br|hr|img|input/)||a.push({event:"stop",offset:t,node:r}));return t}(e,0),a}function i(e){if(r&&!e.langApiRestored){for(var n in e.langApiRestored=!0,r)e[n]&&(e[r[n]]=e[n]);(e.c||[]).concat(e.v||[]).forEach(i)}}function m(c){function s(e){return e&&e.source||e}function o(e,n){return new RegExp(s(e),"m"+(c.cI?"i":"")+(n?"g":""))}!function n(t,e){if(!t.compiled){if(t.compiled=!0,t.k=t.k||t.bK,t.k){var r={},a=function(t,e){c.cI&&(e=e.toLowerCase()),e.split(" ").forEach(function(e){var n=e.split("|");r[n[0]]=[t,n[1]?Number(n[1]):1]})};"string"==typeof t.k?a("keyword",t.k):u(t.k).forEach(function(e){a(e,t.k[e])}),t.k=r}t.lR=o(t.l||/\w+/,!0),e&&(t.bK&&(t.b="\\b("+t.bK.split(" ").join("|")+")\\b"),t.b||(t.b=/\B|\b/),t.bR=o(t.b),t.endSameAsBegin&&(t.e=t.b),t.e||t.eW||(t.e=/\B|\b/),t.e&&(t.eR=o(t.e)),t.tE=s(t.e)||"",t.eW&&e.tE&&(t.tE+=(t.e?"|":"")+e.tE)),t.i&&(t.iR=o(t.i)),null==t.r&&(t.r=1),t.c||(t.c=[]),t.c=Array.prototype.concat.apply([],t.c.map(function(e){return(n="self"===e?t:e).v&&!n.cached_variants&&(n.cached_variants=n.v.map(function(e){return l(n,{v:null},e)})),n.cached_variants||n.eW&&[l(n)]||[n];var n})),t.c.forEach(function(e){n(e,t)}),t.starts&&n(t.starts,e);var i=t.c.map(function(e){return e.bK?"\\.?(?:"+e.b+")\\.?":e.b}).concat([t.tE,t.i]).map(s).filter(Boolean);t.t=i.length?o(function(e,n){for(var t=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./,r=0,a="",i=0;i<e.length;i++){var c=r,o=s(e[i]);for(0<i&&(a+=n);0<o.length;){var u=t.exec(o);if(null==u){a+=o;break}a+=o.substring(0,u.index),o=o.substring(u.index+u[0].length),"\\"==u[0][0]&&u[1]?a+="\\"+String(Number(u[1])+c):(a+=u[0],"("==u[0]&&r++)}}return a}(i,"|"),!0):{exec:function(){return null}}}}(c)}function C(e,n,o,t){function u(e,n,t,r){var a='<span class="'+(r?"":h.classPrefix);return(a+=e+'">')+n+(t?"":b)}function s(){g+=null!=E.sL?function(){var e="string"==typeof E.sL;if(e&&!N[E.sL])return _(R);var n=e?C(E.sL,R,!0,i[E.sL]):O(R,E.sL.length?E.sL:void 0);return 0<E.r&&(d+=n.r),e&&(i[E.sL]=n.top),u(n.language,n.value,!1,!0)}():function(){var e,n,t,r,a,i,c;if(!E.k)return _(R);for(r="",n=0,E.lR.lastIndex=0,t=E.lR.exec(R);t;)r+=_(R.substring(n,t.index)),a=E,i=t,c=f.cI?i[0].toLowerCase():i[0],(e=a.k.hasOwnProperty(c)&&a.k[c])?(d+=e[1],r+=u(e[0],_(t[0]))):r+=_(t[0]),n=E.lR.lastIndex,t=E.lR.exec(R);return r+_(R.substr(n))}(),R=""}function l(e){g+=e.cN?u(e.cN,"",!0):"",E=Object.create(e,{parent:{value:E}})}function r(e,n){if(R+=e,null==n)return s(),0;var t=function(e,n){var t,r,a;for(t=0,r=n.c.length;t<r;t++)if(v(n.c[t].bR,e))return n.c[t].endSameAsBegin&&(n.c[t].eR=(a=n.c[t].bR.exec(e)[0],new RegExp(a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),"m"))),n.c[t]}(n,E);if(t)return t.skip?R+=n:(t.eB&&(R+=n),s(),t.rB||t.eB||(R=n)),l(t),t.rB?0:n.length;var r,a,i=function e(n,t){if(v(n.eR,t)){for(;n.endsParent&&n.parent;)n=n.parent;return n}if(n.eW)return e(n.parent,t)}(E,n);if(i){var c=E;for(c.skip?R+=n:(c.rE||c.eE||(R+=n),s(),c.eE&&(R=n));E.cN&&(g+=b),E.skip||E.sL||(d+=E.r),(E=E.parent)!==i.parent;);return i.starts&&(i.endSameAsBegin&&(i.starts.eR=i.eR),l(i.starts)),c.rE?0:n.length}if(r=n,a=E,!o&&v(a.iR,r))throw new Error('Illegal lexeme "'+n+'" for mode "'+(E.cN||"<unnamed>")+'"');return R+=n,n.length||1}var f=S(e);if(!f)throw new Error('Unknown language: "'+e+'"');m(f);var a,E=t||f,i={},g="";for(a=E;a!==f;a=a.parent)a.cN&&(g=u(a.cN,"",!0)+g);var R="",d=0;try{for(var c,p,M=0;E.t.lastIndex=M,c=E.t.exec(n);)p=r(n.substring(M,c.index),c[0]),M=c.index+p;for(r(n.substr(M)),a=E;a.parent;a=a.parent)a.cN&&(g+=b);return{r:d,value:g,language:e,top:E}}catch(e){if(e.message&&-1!==e.message.indexOf("Illegal"))return{r:0,value:_(n)};throw e}}function O(t,e){e=e||h.languages||u(N);var r={r:0,value:_(t)},a=r;return e.filter(S).filter(s).forEach(function(e){var n=C(e,t,!1);n.language=e,n.r>a.r&&(a=n),n.r>r.r&&(a=r,r=n)}),a.language&&(r.second_best=a),r}function B(e){return h.tabReplace||h.useBR?e.replace(t,function(e,n){return h.useBR&&"\n"===e?"<br>":h.tabReplace?n.replace(/\t/g,h.tabReplace):""}):e}function c(e){var n,t,r,a,i,c,o,u,s,l,f=function(e){var n,t,r,a,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",t=R.exec(i))return S(t[1])?t[1]:"no-highlight";for(n=0,r=(i=i.split(/\s+/)).length;n<r;n++)if(p(a=i[n])||S(a))return a}(e);p(f)||(h.useBR?(n=document.createElementNS("http://www.w3.org/1999/xhtml","div")).innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n"):n=e,i=n.textContent,r=f?C(f,i,!0):O(i),(t=M(n)).length&&((a=document.createElementNS("http://www.w3.org/1999/xhtml","div")).innerHTML=r.value,r.value=function(e,n,t){var r=0,a="",i=[];function c(){return e.length&&n.length?e[0].offset!==n[0].offset?e[0].offset<n[0].offset?e:n:"start"===n[0].event?e:n:e.length?e:n}function o(e){a+="<"+d(e)+E.map.call(e.attributes,function(e){return" "+e.nodeName+'="'+_(e.value).replace('"',"&quot;")+'"'}).join("")+">"}function u(e){a+="</"+d(e)+">"}function s(e){("start"===e.event?o:u)(e.node)}for(;e.length||n.length;){var l=c();if(a+=_(t.substring(r,l[0].offset)),r=l[0].offset,l===e){for(i.reverse().forEach(u);s(l.splice(0,1)[0]),(l=c())===e&&l.length&&l[0].offset===r;);i.reverse().forEach(o)}else"start"===l[0].event?i.push(l[0].node):i.pop(),s(l.splice(0,1)[0])}return a+_(t.substr(r))}(t,M(a),i)),r.value=B(r.value),e.innerHTML=r.value,e.className=(c=e.className,o=f,u=r.language,s=o?g[o]:u,l=[c.trim()],c.match(/\bhljs\b/)||l.push("hljs"),-1===c.indexOf(s)&&l.push(s),l.join(" ").trim()),e.result={language:r.language,re:r.r},r.second_best&&(e.second_best={language:r.second_best.language,re:r.second_best.r}))}function o(){if(!o.called){o.called=!0;var e=document.querySelectorAll("pre code");E.forEach.call(e,c)}}function S(e){return e=(e||"").toLowerCase(),N[e]||N[g[e]]}function s(e){var n=S(e);return n&&!n.disableAutodetect}return a.highlight=C,a.highlightAuto=O,a.fixMarkup=B,a.highlightBlock=c,a.configure=function(e){h=l(h,e)},a.initHighlighting=o,a.initHighlightingOnLoad=function(){addEventListener("DOMContentLoaded",o,!1),addEventListener("load",o,!1)},a.registerLanguage=function(n,e){var t=N[n]=e(a);i(t),t.aliases&&t.aliases.forEach(function(e){g[e]=n})},a.listLanguages=function(){return u(N)},a.getLanguage=S,a.autoDetection=s,a.inherit=l,a.IR=a.IDENT_RE="[a-zA-Z]\\w*",a.UIR=a.UNDERSCORE_IDENT_RE="[a-zA-Z_]\\w*",a.NR=a.NUMBER_RE="\\b\\d+(\\.\\d+)?",a.CNR=a.C_NUMBER_RE="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",a.BNR=a.BINARY_NUMBER_RE="\\b(0b[01]+)",a.RSR=a.RE_STARTERS_RE="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",a.BE=a.BACKSLASH_ESCAPE={b:"\\\\[\\s\\S]",r:0},a.ASM=a.APOS_STRING_MODE={cN:"string",b:"'",e:"'",i:"\\n",c:[a.BE]},a.QSM=a.QUOTE_STRING_MODE={cN:"string",b:'"',e:'"',i:"\\n",c:[a.BE]},a.PWM=a.PHRASAL_WORDS_MODE={b:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},a.C=a.COMMENT=function(e,n,t){var r=a.inherit({cN:"comment",b:e,e:n,c:[]},t||{});return r.c.push(a.PWM),r.c.push({cN:"doctag",b:"(?:TODO|FIXME|NOTE|BUG|XXX):",r:0}),r},a.CLCM=a.C_LINE_COMMENT_MODE=a.C("//","$"),a.CBCM=a.C_BLOCK_COMMENT_MODE=a.C("/\\*","\\*/"),a.HCM=a.HASH_COMMENT_MODE=a.C("#","$"),a.NM=a.NUMBER_MODE={cN:"number",b:a.NR,r:0},a.CNM=a.C_NUMBER_MODE={cN:"number",b:a.CNR,r:0},a.BNM=a.BINARY_NUMBER_MODE={cN:"number",b:a.BNR,r:0},a.CSSNM=a.CSS_NUMBER_MODE={cN:"number",b:a.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},a.RM=a.REGEXP_MODE={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[a.BE,{b:/\[/,e:/\]/,r:0,c:[a.BE]}]},a.TM=a.TITLE_MODE={cN:"title",b:a.IR,r:0},a.UTM=a.UNDERSCORE_TITLE_MODE={cN:"title",b:a.UIR,r:0},a.METHOD_GUARD={b:"\\.\\s*"+a.UIR,r:0},a});hljs.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},s={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]};return{aliases:["sh","zsh"],l:/\b-?[a-z\._]+\b/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",_:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"meta",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,s,{cN:"string",b:/'/,e:/'/},t]}});hljs.registerLanguage("shell",function(s){return{aliases:["console"],c:[{cN:"meta",b:"^\\s{0,3}[\\w\\d\\[\\]()@-]*[>%$#]",starts:{e:"$",sL:"bash"}}]}});hljs.registerLanguage("xml",function(s){var e={eW:!0,i:/</,r:0,c:[{cN:"attr",b:"[A-Za-z0-9\\._:-]+",r:0},{b:/=\s*/,r:0,c:[{cN:"string",endsParent:!0,v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s"'=<>`]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist"],cI:!0,c:[{cN:"meta",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},s.C("\x3c!--","--\x3e",{r:10}),{b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"meta",b:/<\?xml/,e:/\?>/,r:10},{b:/<\?(php)?/,e:/\?>/,sL:"php",c:[{b:"/\\*",e:"\\*/",skip:!0},{b:'b"',e:'"',skip:!0},{b:"b'",e:"'",skip:!0},s.inherit(s.ASM,{i:null,cN:null,c:null,skip:!0}),s.inherit(s.QSM,{i:null,cN:null,c:null,skip:!0})]},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{name:"style"},c:[e],starts:{e:"</style>",rE:!0,sL:["css","xml"]}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{name:"script"},c:[e],starts:{e:"<\/script>",rE:!0,sL:["actionscript","javascript","handlebars","xml"]}},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"name",b:/[^\/><\s]+/,r:0},e]}]}});hljs.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"section",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"quote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"^```w*s*$",e:"^```s*$"},{b:"`.+?`"},{b:"^( {4}|\t)",e:"$",r:0}]},{b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"string",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"symbol",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:/^\[[^\n]+\]:/,rB:!0,c:[{cN:"symbol",b:/\[/,e:/\]/,eB:!0,eE:!0},{cN:"link",b:/:\s*/,e:/$/,eB:!0}]}]}});hljs.registerLanguage("typescript",function(e){var r="[A-Za-z$_][0-9A-Za-z$_]*",t={keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class public private protected get set super static implements enum export import declare type namespace abstract as from extends async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document any number boolean string void Promise"},n={cN:"meta",b:"@"+r},a={b:"\\(",e:/\)/,k:t,c:["self",e.QSM,e.ASM,e.NM]},o={cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,k:t,c:[e.CLCM,e.CBCM,n,a]};return{aliases:["ts"],k:t,c:[{cN:"meta",b:/^\s*['"]use strict['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{cN:"function",b:"(\\(.*?\\)|"+e.IR+")\\s*=>",rB:!0,e:"\\s*=>",c:[{cN:"params",v:[{b:e.IR},{b:/\(\s*\)/},{b:/\(/,e:/\)/,eB:!0,eE:!0,k:t,c:["self",e.CLCM,e.CBCM]}]}]}],r:0},{cN:"function",b:"function",e:/[\{;]/,eE:!0,k:t,c:["self",e.inherit(e.TM,{b:r}),o],i:/%/,r:0},{bK:"constructor",e:/\{/,eE:!0,c:["self",o]},{b:/module\./,k:{built_in:"module"},r:0},{bK:"module",e:/\{/,eE:!0},{bK:"interface",e:/\{/,eE:!0,k:"interface extends"},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},n,a]}});hljs.registerLanguage("css",function(e){var c={b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{eW:!0,eE:!0,c:[{b:/[\w-]+\(/,rB:!0,c:[{cN:"built_in",b:/[\w-]+/},{b:/\(/,e:/\)/,c:[e.ASM,e.QSM]}]},e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"number",b:"#[0-9A-Fa-f]+"},{cN:"meta",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,{cN:"selector-id",b:/#[A-Za-z0-9_-]+/},{cN:"selector-class",b:/\.[A-Za-z0-9_-]+/},{cN:"selector-attr",b:/\[/,e:/\]/,i:"$"},{cN:"selector-pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/},{b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{b:"@",e:"[{;]",i:/:/,c:[{cN:"keyword",b:/\w+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[e.ASM,e.QSM,e.CSSNM]}]},{cN:"selector-tag",b:"[a-zA-Z-][a-zA-Z0-9_-]*",r:0},{b:"{",e:"}",i:/\S/,c:[e.CBCM,c]}]}});hljs.registerLanguage("less",function(e){var r="[\\w-]+",t="("+r+"|@{"+r+"})",a=[],c=[],s=function(e){return{cN:"string",b:"~?"+e+".*?"+e}},b=function(e,r,t){return{cN:e,b:r,r:t}},n={b:"\\(",e:"\\)",c:c,r:0};c.push(e.CLCM,e.CBCM,s("'"),s('"'),e.CSSNM,{b:"(url|data-uri)\\(",starts:{cN:"string",e:"[\\)\\n]",eE:!0}},b("number","#[0-9A-Fa-f]+\\b"),n,b("variable","@@?"+r,10),b("variable","@{"+r+"}"),b("built_in","~?`[^`]*?`"),{cN:"attribute",b:r+"\\s*:",e:":",rB:!0,eE:!0},{cN:"meta",b:"!important"});var i=c.concat({b:"{",e:"}",c:a}),o={bK:"when",eW:!0,c:[{bK:"and not"}].concat(c)},u={b:t+"\\s*:",rB:!0,e:"[;}]",r:0,c:[{cN:"attribute",b:t,e:":",eE:!0,starts:{eW:!0,i:"[<=$]",r:0,c:c}}]},l={cN:"keyword",b:"@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",starts:{e:"[;{}]",rE:!0,c:c,r:0}},C={cN:"variable",v:[{b:"@"+r+"\\s*:",r:15},{b:"@"+r}],starts:{e:"[;}]",rE:!0,c:i}},p={v:[{b:"[\\.#:&\\[>]",e:"[;{}]"},{b:t,e:"{"}],rB:!0,rE:!0,i:"[<='$\"]",r:0,c:[e.CLCM,e.CBCM,o,b("keyword","all\\b"),b("variable","@{"+r+"}"),b("selector-tag",t+"%?",0),b("selector-id","#"+t),b("selector-class","\\."+t,0),b("selector-tag","&",0),{cN:"selector-attr",b:"\\[",e:"\\]"},{cN:"selector-pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/},{b:"\\(",e:"\\)",c:i},{b:"!important"}]};return a.push(e.CLCM,e.CBCM,l,C,u,p),{cI:!0,i:"[=>'/<($\"]",c:a}});hljs.registerLanguage("json",function(e){var i={literal:"true false null"},n=[e.QSM,e.CNM],r={e:",",eW:!0,eE:!0,c:n,k:i},t={b:"{",e:"}",c:[{cN:"attr",b:/"/,e:/"/,c:[e.BE],i:"\\n"},e.inherit(r,{b:/:/})],i:"\\S"},c={b:"\\[",e:"\\]",c:[e.inherit(r)],i:"\\S"};return n.splice(n.length,0,t,c),{c:n,k:i,i:"\\S"}});hljs.registerLanguage("scss",function(e){var t={cN:"variable",b:"(\\$[a-zA-Z-][a-zA-Z0-9_-]*)\\b"},i={cN:"number",b:"#[0-9A-Fa-f]+"};e.CSSNM,e.QSM,e.ASM,e.CBCM;return{cI:!0,i:"[=/|']",c:[e.CLCM,e.CBCM,{cN:"selector-id",b:"\\#[A-Za-z0-9_-]+",r:0},{cN:"selector-class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"selector-attr",b:"\\[",e:"\\]",i:"$"},{cN:"selector-tag",b:"\\b(a|abbr|acronym|address|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|frame|frameset|(h[1-6])|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|ul|var|video)\\b",r:0},{b:":(visited|valid|root|right|required|read-write|read-only|out-range|optional|only-of-type|only-child|nth-of-type|nth-last-of-type|nth-last-child|nth-child|not|link|left|last-of-type|last-child|lang|invalid|indeterminate|in-range|hover|focus|first-of-type|first-line|first-letter|first-child|first|enabled|empty|disabled|default|checked|before|after|active)"},{b:"::(after|before|choices|first-letter|first-line|repeat-index|repeat-item|selection|value)"},t,{cN:"attribute",b:"\\b(z-index|word-wrap|word-spacing|word-break|width|widows|white-space|visibility|vertical-align|unicode-bidi|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform-style|transform-origin|transform|top|text-underline-position|text-transform|text-shadow|text-rendering|text-overflow|text-indent|text-decoration-style|text-decoration-line|text-decoration-color|text-decoration|text-align-last|text-align|tab-size|table-layout|right|resize|quotes|position|pointer-events|perspective-origin|perspective|page-break-inside|page-break-before|page-break-after|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-y|overflow-x|overflow-wrap|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|order|opacity|object-position|object-fit|normal|none|nav-up|nav-right|nav-left|nav-index|nav-down|min-width|min-height|max-width|max-height|mask|marks|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|letter-spacing|left|justify-content|initial|inherit|ime-mode|image-orientation|image-resolution|image-rendering|icon|hyphens|height|font-weight|font-variant-ligatures|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-language-override|font-kerning|font-feature-settings|font-family|font|float|flex-wrap|flex-shrink|flex-grow|flex-flow|flex-direction|flex-basis|flex|filter|empty-cells|display|direction|cursor|counter-reset|counter-increment|content|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|columns|color|clip-path|clip|clear|caption-side|break-inside|break-before|break-after|box-sizing|box-shadow|box-decoration-break|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-left-width|border-left-style|border-left-color|border-left|border-image-width|border-image-source|border-image-slice|border-image-repeat|border-image-outset|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-attachment|background-blend-mode|background|backface-visibility|auto|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-fill-mode|animation-duration|animation-direction|animation-delay|animation|align-self|align-items|align-content)\\b",i:"[^\\s]"},{b:"\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b"},{b:":",e:";",c:[t,i,e.CSSNM,e.QSM,e.ASM,{cN:"meta",b:"!important"}]},{b:"@",e:"[{;]",k:"mixin include extend for if else each while charset import debug media page content font-face namespace warn",c:[t,e.QSM,e.ASM,i,e.CSSNM,{b:"\\s[A-Za-z0-9_.-]+",r:0}]}]}});hljs.registerLanguage("javascript",function(e){var r="[A-Za-z$_][0-9A-Za-z$_]*",t={keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await static import from as",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},a={cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},n={cN:"subst",b:"\\$\\{",e:"\\}",k:t,c:[]},c={cN:"string",b:"`",e:"`",c:[e.BE,n]};n.c=[e.ASM,e.QSM,c,a,e.RM];var s=n.c.concat([e.CBCM,e.CLCM]);return{aliases:["js","jsx"],k:t,c:[{cN:"meta",r:10,b:/^\s*['"]use (strict|asm)['"]/},{cN:"meta",b:/^#!/,e:/$/},e.ASM,e.QSM,c,e.CLCM,e.CBCM,a,{b:/[{,]\s*/,r:0,c:[{b:r+"\\s*:",rB:!0,r:0,c:[{cN:"attr",b:r,r:0}]}]},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{cN:"function",b:"(\\(.*?\\)|"+r+")\\s*=>",rB:!0,e:"\\s*=>",c:[{cN:"params",v:[{b:r},{b:/\(\s*\)/},{b:/\(/,e:/\)/,eB:!0,eE:!0,k:t,c:s}]}]},{b:/</,e:/(\/\w+|\w+\/)>/,sL:"xml",c:[{b:/<\w+\s*\/>/,skip:!0},{b:/<\w+/,e:/(\/\w+|\w+\/)>/,skip:!0,c:[{b:/<\w+\s*\/>/,skip:!0},"self"]}]}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:r}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:s}],i:/\[|%/},{b:/\$[(.]/},e.METHOD_GUARD,{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]},{bK:"constructor get set",e:/\{/,eE:!0}],i:/#(?!!)/}});

/**
 * ngPanel by @matsko
 * https://github.com/matsko/ng-panel
 */
angular.module('docsApp')
  .directive('ngPanel', ['$animate', function($animate) {
    return {
      restrict: 'EA',
      transclude: 'element',
      terminal: true,
      compile: function(elm, attrs) {
        var attrExp = attrs.ngPanel || attrs['for'];
        var regex = /^(\S+)(?:\s+track by (.+?))?$/;
        var match = regex.exec(attrExp);

        var watchCollection = true;
        var objExp = match[1];
        var trackExp = match[2];
        if (trackExp) {
          watchCollection = false;
        } else {
          trackExp = match[1];
        }

        return function(scope, $element, attrs, ctrl, $transclude) {
          var previousElement, previousScope;
          scope[watchCollection ? '$watchCollection' : '$watch'](trackExp, function(value) {
            if (previousElement) {
              $animate.leave(previousElement);
            }
            if (previousScope) {
              previousScope.$destroy();
              previousScope = null;
            }
            var record = watchCollection ? value : scope.$eval(objExp);
            previousScope = scope.$new();
            $transclude(previousScope, function(element) {
              previousElement = element;
              $animate.enter(element, null, $element);
            });
          });
        };
      }
    };
  }]);


(function() {
  angular.module('docsApp')
    .factory('$demoAngularScripts', ['BUILDCONFIG', DemoAngularScripts]);

  function DemoAngularScripts(BUILDCONFIG) {
    var scripts = [
      'angular.js',
      'angular-animate.min.js',
      'angular-route.min.js',
      'angular-aria.min.js',
      'angular-messages.min.js'
    ];

    return {
      all: allAngularScripts
    };

    function allAngularScripts() {
      return scripts.map(fullPathToScript);
    }

    function fullPathToScript(script) {
      return "https://ajax.googleapis.com/ajax/libs/angularjs/" + BUILDCONFIG.ngVersion + "/" + script;
    }
  }
})();

angular.module('docsApp').constant('SERVICES', [
  {
    "name": "$mdMedia",
    "type": "service",
    "outputPath": "partials/api/material.core/service/$mdMedia.html",
    "url": "api/service/$mdMedia",
    "label": "$mdMedia",
    "module": "material.core",
    "githubUrl": "https://github.com/angular/material/blob/master/src/core/util/media.js",
    "hasDemo": false
  }
]);
