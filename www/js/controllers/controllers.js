angular.module('volunteersRUs.controllers', [])

.controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, AuthService) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo', '{}');
    $scope.reservation = {};
    $scope.registration = {};
    $scope.loggedIn = false;

    if (AuthService.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthService.getUsername();
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo', $scope.loginData);

        AuthService.login($scope.loginData);

        $scope.closeLogin();
    };

    $scope.logOut = function () {
        AuthService.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };

    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthService.isAuthenticated();
        $scope.username = AuthService.getUsername();
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/reserve.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.reserveform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeReserve = function () {
        $scope.reserveform.hide();
    };

    // Open the login modal
    $scope.reserve = function () {
        $scope.reserveform.show();
    };



    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);
        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.password = $scope.registration.password;

        AuthService.register($scope.registration);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };

    $rootScope.$on('registration:Successful', function () {
        $localStorage.storeObject('userinfo', $scope.loginData);
    });

    /*  $ionicPlatform.ready(function() {
          var options = {
              quality: 50,
              destinationType: Camera.DestinationType.DATA_URL,
              sourceType: Camera.PictureSourceType.CAMERA,
              allowEdit: true,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 100,
              targetHeight: 100,
              popoverOptions: CameraPopoverOptions,
              saveToPhotoAlbum: false
          };

          $scope.takePicture = function() {
              $cordovaCamera.getPicture(options).then(function(imageData) {
                  $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
              }, function(err) {
                  console.log(err);
              });
              $scope.registerform.show();
          };

            var pickoptions = {
                maximumImagesCount: 1,
                width: 100,
                height: 100,
                quality: 50
            };

          $scope.pickImage = function() {
            $cordovaImagePicker.getPictures(pickoptions)
                .then(function (results) {
                    for (var i = 0; i < results.length; i++) {
                        console.log('Image URI: ' + results[i]);
                        $scope.registration.imgSrc = results[0];
                    }
                }, function (error) {
                    // error getting photos
                });
          };

      });  */
})

.controller('VolunteerEventController', ['$scope', '$rootScope', 'Volunteerevents', 'Favorites', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, $rootScope, Volunteerevents, Favorites, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;

    console.log("Entered VolunteerEventController");
    Volunteerevents.find()
        .$promise.then(
            function (response) {
                $scope.volunteerevents = response;
                console.log("Response for VolunteerEvents.find =" + JSON.stringify($scope.volunteerevents));
                $scope.showDetails = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });

    $scope.select = function (setTab) {
        $scope.tab = setTab;

    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.addFavorite = function (volunteereventId) {
        console.log("volunteereventId is " + volunteereventId);

        Favorites.create({
            customerId: $rootScope.currentUser.id,
            volunteereventsId: volunteereventId
        }).$promise.then(
            function (response) {
                $scope.favorites = response;
            },
            function (response) {});
        $ionicListDelegate.closeOptionButtons();

        $ionicPlatform.ready(function () {

            $cordovaLocalNotification.schedule({
                id: 1,
                title: "Added Favorite",
                text: $scope.volunteerevents[volunteereventId].name
            }).then(function () {
                    console.log('Added Favorite ' + $scope.volunteerevents[volunteereventId].name);
                },
                function () {
                    console.log('Failed to add Favorite ');
                });

            $cordovaToast
                .show('Added Favorite ' + $scope.volunteerevents[volunteereventId].name, 'long', 'center')
                .then(function (success) {
                    // success
                }, function (error) {
                    // error
                });


        });
    }
}])

.controller('ContactController', ['$scope', '$ionicModal', '$timeout', function ($scope, $ionicModal, $timeout) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/feedback.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.feedbackform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeFeedback = function () {
        $scope.feedbackform.hide();
    };

    // Open the login modal
    $scope.feedback = function () {
        $scope.feedbackform.show();
    };

    $scope.sendFeedback = function () {

        console.log($scope.feedback);

        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        } else {
            $scope.invalidChannelSelection = false;
            // feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            console.log($scope.feedback);
        }
    };
}])

.controller('VolunteerEventDetailController', ['$scope', '$rootScope', '$state', '$stateParams', 'Volunteerevents', 'Favorites', 'Comments','Registeredvolunteerevents', 'baseURL', '$ionicPopover', '$ionicModal', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', '$cordovaSocialSharing', function ($scope, $rootScope, $state, $stateParams, Volunteerevents, Favorites, Comments, Registeredvolunteerevents, baseURL, $ionicPopover, $ionicModal, $ionicPlatform, $cordovaLocalNotification, $cordovaToast, $cordovaSocialSharing) {

    $scope.baseURL = baseURL;


    $scope.volunteerevent = Volunteerevents.findById({
            id: $stateParams.id
        })
        .$promise.then(
            function (response) {
                $scope.volunteerevent = response;
                $scope.volunteerevent.comments = Volunteerevents.comments({
                    id: $stateParams.id,
                    "filter": {
                        "include": ["customer"]
                    }
                });
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );


    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/volunteerevent-detail-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });


    $scope.openPopover = function ($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function () {
        // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function () {
        // Execute action
    });

    $scope.addFavorite = function () {
        console.log("Entered addFavorite =" + $stateParams.id);

        Favorites.create({
            customerId: $rootScope.currentUser.id,
            volunteereventsId: $stateParams.id
        }).$promise.then(
                function (response) {
                    $scope.favorites = response;
                    console.log("successfully creation in addFavorite and response=" + JSON.stringify(response));
                },
                function (response) {});;
        $scope.popover.hide();


        $ionicPlatform.ready(function () {

            $cordovaLocalNotification.schedule({
                id: 1,
                title: "Added Favorite",
                text: $scope.volunteerevent.name
            }).then(function () {
                    console.log('Added Favorite ' + $scope.volunteerevent.name);
                },
                function () {
                    console.log('Failed to add Favorite ');
                });

            $cordovaToast
                .show('Added Favorite ' + $scope.dish.name, 'long', 'bottom')
                .then(function (success) {
                    // success
                }, function (error) {
                    // error
                });


        });

    };

    //-----------------------


    $scope.addRegisteredEvent = function () {
        console.log("Entered addRegisteredEvent =" + $stateParams.id);

        Registeredvolunteerevents.create({
            customerId: $rootScope.currentUser.id,
            volunteereventsId: $stateParams.id
        }).$promise.then(
                function (response) {
                console.log("Successfully created Registered event and response=" + JSON.stringify(response));
                },
                function (response) {});;
        $scope.popover.hide();


        $ionicPlatform.ready(function () {

            $cordovaLocalNotification.schedule({
                id: 1,
                title: "Registered event",
                text: $scope.volunteerevent.name
            }).then(function () {
                    console.log('Added RegisteredEvent' + $scope.volunteerevent.name);
                },
                function () {
                    console.log('Failed to register event ');
                });

            $cordovaToast
                .show('Registered event ' + $scope.volunteerevent.name, 'long', 'bottom')
                .then(function (success) {
                    // success
                }, function (error) {
                    // error
                });


        });

    };


    //-------------------------

    $scope.mycomment = {
        rating: 5,
        comment: "",
        volunteereventsId: $stateParams.id
    };

    $scope.submitComment = function () {

        if ($rootScope.currentUser)
            $scope.mycomment.customerId = $rootScope.currentUser.id;

        Comments.create($scope.mycomment);

        $scope.closeCommentForm();


        $scope.mycomment = {
            rating: 5,
            comment: "",
            volunteereventsId: $stateParams.id
        };

        $state.go($state.current, null, {
            reload: true
        });
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/volunteerevent-comment.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.commentForm = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeCommentForm = function () {
        $scope.commentForm.hide();
    };

    // Open the login modal
    $scope.showCommentForm = function () {
        $scope.commentForm.show();
        $scope.popover.hide();
    };

    $ionicPlatform.ready(function () {

        var message = $scope.volunteerevent.description;
        var subject = $scope.volunteerevent.name;
        var link = $scope.baseURL + $scope.volunteerevent.image;
        var image = $scope.baseURL + $scope.volunteerevent.image;

        $scope.nativeShare = function () {
            $cordovaSocialSharing
                .share(message, subject, link); // Share via native share sheet
        };

        //checkout http://ngcordova.com/docs/plugins/socialSharing/
        // for other sharing options
    });

}])


// implement the IndexController and About Controller here

.controller('IndexController', ['$scope', 'Volunteerevents', 'Leaders', 'baseURL', function ($scope, Volunteerevents, Leaders, baseURL) {

    $scope.baseURL = baseURL;
    Leaders.findOne({
            "filter": {
                "where": {
                    "featured": "true"
                }
            }
        })
        .$promise.then(
            function (response) {
                $scope.leader = response;
            },
            function (response) {}
        );
    console.log("About to fetch volunteerevents in IndexController");
    Volunteerevents.findOne({
            "filter": {
                "where": {
                    "featuredevent": "true"
                }
            }
        })
        .$promise.then(
            function (response) {
                $scope.volunteerevent = response;
                console.log("found featuredVolunteerEvent" + JSON.stringify(response));
            },
            function (response) {}
        );
}])

.controller('AboutController', ['$scope', 'Leaders', 'baseURL', function ($scope, Leaders, baseURL) {

    $scope.baseURL = baseURL;
    $scope.leaders = Leaders.find();

}])

.controller('FavoritesController', ['$scope', '$rootScope', '$state', 'Favorites', 'Customer', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPlatform', '$cordovaVibration', function ($scope, $rootScope, $state, Favorites, Customer, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaVibration) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    if ($rootScope.currentUser) {
        Customer.favorites({
                id: $rootScope.currentUser.id,
                "filter": {
                    "include": ["volunteerevents"]
                }
            })
            .$promise.then(
                function (response) {
                    $scope.favorites = response;
                },
                function (response) {});
    } else {
        $scope.message = "You are not logged in"
    }


    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }

    $scope.deleteFavorite = function (favoriteid) {

        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });

        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                Favorites.deleteById({
                    id: favoriteid
                }).$promise.then(
                    function (response) {
                        console.log("Successfully deleted the favorite");
                    },
                    function (response) {});

                $state.go($state.current, {}, {
                    reload: true
                });
                // $window.location.reload();
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;


    }

}])


.controller('RegisteredEventsController', ['$scope', '$rootScope', '$state', 'Registeredvolunteerevents', 'Customer', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPlatform', '$cordovaVibration', function ($scope, $rootScope, $state, Registeredvolunteerevents, Customer, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaVibration) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    if ($rootScope.currentUser) {
        Customer.registeredvolunteerevents({
                id: $rootScope.currentUser.id,
                "filter": {
                    "include": ["volunteerevents"]
                }
            })
            .$promise.then(
                function (response) {
                    $scope.registeredvolunteerevents = response;
                },
                function (response) {});
    } else {
        $scope.message = "You are not logged in"
    }


    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }

    $scope.deleteRegisteredEvent = function (registeredVolunteerEventId) {

        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });

        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                Registeredvolunteerevents.deleteById({
                    id: registeredVolunteerEventId
                }).$promise.then(
                    function (response) {
                        console.log("Successfully deleted the Registered event");
                    },
                    function (response) {});

                $state.go($state.current, {}, {
                    reload: true
                });
                // $window.location.reload();
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;


    }

}])

;
