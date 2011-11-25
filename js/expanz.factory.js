

$(function(){

   window.expanz = window.expanz || {};

   window.expanz.Factory = {

      Activity: function (viewNamespace, activityEl) {
         // create a collection for each activity
         var activityModel = new expanz.Model.Activity({
            name: $(activityEl).attr('name'),
            title: $(activityEl).attr('title'),
            url: $(activityEl).attr('url')
         });
         var activityView = new viewNamespace.ActivityView({
            el: $(activityEl),
            id: $(activityEl).attr('name'),
            collection: activityModel
         });
         _.each(expanz.Factory.Field(viewNamespace, $(activityEl).find('[bind=field]')), function (fieldModel) {
            fieldModel.set({
               parent: activityModel
            });
            activityModel.add(fieldModel);
         });


         _.each(expanz.Factory.Method(viewNamespace, $(activityEl).find('[bind=method]')), function (methodModel) {
            methodModel.set({
               parent: activityModel
            });
            activityModel.add(methodModel);
         });

         _.each(expanz.Factory.Grid(viewNamespace, activityModel.getAttr('name'), $(activityEl).find('[bind=grid]')), function (gridModel) {
            gridModel.setAttr({
               parent: activityModel,
               activityId: activityModel.getAttr('name')
            });
            activityModel.addGrid(gridModel);
         });


         //activities[ $(activityEl).attr('name') ] = activityView;
         return activityView;
      },


      Field: function (viewNamespace, DOMObjects) {

         var fieldModels = [];
         _.each(DOMObjects, function (fieldEl) {
            // create a model for each field
            var field = new expanz.Model.Field({
               id: $(fieldEl).attr('name'),
               //parent:  activityModel
            });
            var view = new viewNamespace.FieldView({
               el: $(fieldEl),
               id: $(fieldEl).attr('id'),
               className: $(fieldEl).attr('class'),
               model: field
            });

            fieldModels.push(field);
         });
         return fieldModels;
      },

      Method: function (viewNamespace, DOMObjects) {

         var methodModels = [];
         _.each(DOMObjects, function (methodEl) {
            // create a model for each method
            var method = new expanz.Model.Method({
               id: $(methodEl).attr('name'),
               //parent:  activityModel
            });
            var view = new viewNamespace.MethodView({
               el: $(methodEl),
               id: $(methodEl).attr('id'),
               className: $(methodEl).attr('class'),
               model: method
            });

            methodModels.push(method);
         });
         return methodModels;
      },

      Grid: function (viewNamespace, activityName, DOMObjects) {

         var gridModels = [];

         _.each(DOMObjects, function (gridEl) {
            // create a model for each GridView
            var gridModel = new expanz.Model.Data.Grid({
               id: $(gridEl).attr('name'),
               populateMethod: $(gridEl).attr('populateMethod'),
               //parent:           activityModel
            });
            var view = new viewNamespace.GridView({
               el: $(gridEl),
               id: $(gridEl).attr('id'),
               className: $(gridEl).attr('class'),
               model: gridModel
            });

            // load pre-defined gridview information from formmapping.xml
            $.get('./formmapping.xml', function (defaultsXML) {
               var activityInfo = _.find($(defaultsXML).find('activity'), function (activityXML) {
                  return $(activityXML).attr('name') === activityName;
               });
               if (activityInfo) {
                  var gridviewInfo = _.find($(activityInfo).find('gridview'), function (gridviewXML) {
                     return $(gridviewXML).attr('id') === gridModel.getAttr('id');
                  });
                  if (gridviewInfo) {

                     // found the gridview information from formmapping.xml. Now adding to gridModel
                     _.each($(gridviewInfo).find('column'), function (column) {
                        gridModel.addColumnDefault($(column).attr('id'), $(column).attr('field'), $(column).attr('label'), $(column).attr('datatype'), $(column).attr('width'));
                     });
                  }

               }
            })

            gridModels.push(gridModel);
         });
         return gridModels;
      },

   };

});
