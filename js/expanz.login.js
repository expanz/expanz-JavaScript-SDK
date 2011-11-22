/* Author: Adam Tait

*/

$(function(){

   window.App = pullActivities(  expanz.Views.Login,
                                 $('body')
                                 );

   function pullActivities(   viewNamespace, dom ){
      viewNamespace || (viewNamespace = expanz.Views);
      dom || (dom = $('body'));

      var activities = {};

      // search through DOM body, looking for elements with 'bind' attribute
      _.each(  $(dom).find('[bind=activity]'),
               function( activityEl ){
                  // create a collection for each activity
                  var activityModel = new expanz.Models.Login.Activity({  
                                       name:    $(activityEl).attr('name'),
                                       title:   $(activityEl).attr('title'),
                                       url:     $(activityEl).attr('url')
                                       });
                  var activityView = new viewNamespace.ActivityView({
                                       el:         $(activityEl),
                                       id:         $(activityEl).attr('name'),
                                       collection: activityModel
                                       });

                  _.each(  $(activityEl).find('[bind=field]'),
                           function( fieldEl ){
                              // create a model for each field
                              if( $(fieldEl).attr('name') !== "error" ){
                                 var field = new expanz.Models.Field({
                                             id:      $(fieldEl).attr('name'),
                                             label:   $(fieldEl).attr('name')
                                             });
                                 var view = new viewNamespace.FieldView({
                                             el:         $(fieldEl),
                                             id:         $(fieldEl).attr('id'),
                                             className:  $(fieldEl).attr('class'),
                                             model:      field
                                             });
                              } else {
                                 var field = new expanz.Models.Bindable({
                                             id:      $(fieldEl).attr('name'),
                                             label:   $(fieldEl).attr('name')
                                             });
                                 var view = new viewNamespace.DependantFieldView({
                                             el:         $(fieldEl),
                                             id:         $(fieldEl).attr('id'),
                                             className:  $(fieldEl).attr('class'),
                                             model:      field
                                             });
                                 activityView.errorView = view;
                              }
                              activityModel.add( field );
                           }
                  );

                  _.each(  $(activityEl).find('[bind=method]'),
                           function( fieldEl ){
                              // create a model for each method
                              var method = new expanz.Models.Method({
                                             id:      $(fieldEl).attr('name'),
                                             label:   $(fieldEl).find('[attribute=label]')
                                             });
                              var view = new viewNamespace.MethodView({
                                             el:         $(fieldEl),
                                             id:         $(fieldEl).attr('id'),
                                             className:  $(fieldEl).attr('class'),
                                             model:      method
                                             });
                              activityModel.add( method );
                           }
                  );
                  activities[ $(activityEl).attr('name') ] = activityView;
                  
               }
      ); // _.each activity
      return activities;
   }

})





















