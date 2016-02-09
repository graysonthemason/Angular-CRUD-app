(function () {
  console.log("app.js linked");
  var app = angular.module('YellowHammerApp', [
    //dependencies go here
    ]);

// DIRECTIVES
  app.directive('fileInput', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        el.bind('change', function () {
          $parse(attrs.fileInput).assign(scope, el[0].files);
          scope.$apply();
        });
      }
    };
  }]);

//CONTROLLERS
  app.controller('uploader', ['$scope', function ($scope) {
    $scope.iframeShow    = false;
    $scope.uploadedFiles = [];
    $scope.sortShow      = false;
    $scope.predicate     = '-name';
    var editing          = true;
    $scope.filesChanged = function (el) {
      $scope.files = el.files;
      $scope.$apply();
    };

    $scope.upload = function () {
      var fileCount     = $scope.files.length;
      var uploadedCount = 0;
      angular.forEach($scope.files, function (file) {
        var object = {
          Key: "grayreinhard/" + file.name,
          ContentType: file.type,
          ACL: "public-read",
          Body: file
        };
        NProgress.start();
        //upload file to bucket and update progress bar
        bucket.putObject(object, function (err, data) {
          uploaded = function () {
            return fileCount === uploadedCount;
          }
          if (err) {
            console.log(err);
            uploadedCount += 1;
            NProgress.inc(1/fileCount);
            if (uploaded()) {
              NProgress.done();
            }
          }
          if (data) {
            console.log(data);
            uploadedCount += 1;
            NProgress.inc(1/fileCount);
            if (uploaded()) {
              NProgress.done();
              $("#uploadedFilesList > a, button").removeClass("disabled");
            }
          }
        });
        var viewObject  = object;
        viewObject.name = file.name;
        $scope.uploadedFiles.push(viewObject);
        $scope.sortShow = true;
      });
      $scope.files = [];
    };

    $scope.delete = function () {
      bucket.deleteObject({
        Key: $scope.uploadedFiles[this.$index].Key}, function (err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data + "deleted");
      });
      console.log(this.$index);
      $scope.uploadedFiles.splice(this.$index, 1);
      if ($scope.uploadedFiles.length == 0) {
        $scope.sortShow = false;
      }
    };

    $scope.edit = function () {
      editing = false;
      $scope.$apply();
    };

  }]);

//BUCKET STUFF
  AWS.config.update({
    accessKeyId:     'AKIAI2SSJ7JNXGZM372Q',
    secretAccessKey: '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'
  });
  var bucket  = new AWS.S3({params: {Bucket: 'yh.interview'}});

})()
