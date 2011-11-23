/* Author: Adam Tait

*/

$(function(){

   window.expanz = window.expanz || {};
   window.expanz.Views = {};

   window.expanz.Views.FieldView = Backbone.View.extend({

      initialize: function(){
         this.model.bind( "change:label", this.modelUpdate('label'), this );
         this.model.bind( "change:value", this.modelUpdate('value'), this );
      },

      modelUpdate: function( attr ){
         return function(){
            var elem = this.el.find('[attribute='+ attr +']');
            updateViewElement( elem, this.model.get(attr) );
            this.el.trigger( 'update:field' );
         };
      },

      events:  {
         "change [attribute=value]":   "viewUpdate",
      },

      viewUpdate:  function(){
         this.model.update({ value:   this.el.find('[attribute=value]').val() });
         this.el.trigger( 'update:field' );
      }
      
   });

   window.expanz.Views.DependantFieldView = Backbone.View.extend({

      initialize: function(){
         this.model.bind( "change:value", this.toggle, this );
      },

      toggle:  function(){
         var elem = this.el.find('[attribute=value]');
         updateViewElement( elem, this.model.get('value') );

         if( this.model.get( 'value' ).length > 0 ){
            this.el.show( 'slow' );
         } else {
            this.el.hide( 'slow' );
         }
      }

      
   });

   window.expanz.Views.MethodView = Backbone.View.extend({

      events:  {
         "click [attribute=submit]":   "submit"
      },

      submit: function(){
         this.model.submit();
         this.el.trigger( 'submit:' + this.model.get('id') );
      }

   });

   window.expanz.Views.ActivityView = Backbone.View.extend({

      initialize: function() {
         this.collection.bind( "error", this.updateError, this );
      },

      updateError: function( model, error ){
         this.collection.get('error').set({ value: error });
      },

      events:  {
         "update:field":   "update"
      },

      update: function(){
         // perform full activity validation after a field updates ... if necessary
      },

   });

   // Public Functions

   window.expanz.Views.redirect = function(destinationURL ){
      window.location.href = destinationURL;
   };

   
   window.expanz.Views.loadMenu = function( el ){

      // Load Menu & insert it into #menu
      var menu = new expanz.Storage.AppSiteMenu();
      _.each( expanz.Storage.getProcessAreaList(), function( processArea ) {
         var menuItem = new expanz.Storage.ProcessAreaMenu( processArea.id, processArea.title );
         menu.processAreas.push( menuItem );

         _.each( processArea.activities, function( activity ){
            menuItem.activities.push( new expanz.Storage.ActivityMenu(  activity.name,
                                                                        activity.title,
                                                                        activity.url )
                                    );
         });
      });

      menu.load( el );
   }

   window.expanz.Views.load = function(   dom){

      var viewNamespace = expanz.Views;
      dom || (dom = $('body'));

      var activities = {};

      // search through DOM body, looking for elements with 'bind' attribute
      _.each(  $(dom).find('[bind=activity]'),
               function( activityEl ){
                  // create a collection for each activity
                  var activityModel = new expanz.Models.Activity({  
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
                                             parent:  activityModel
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
                                             parent:  activityModel
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
                                             label:   $(fieldEl).find('[attribute=label]'),
                                             parent:  activityModel
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

                  _.each(  $(activityEl).find('[bind=gridview]'),
                           function( gridviewEl ){
                              // create a model for each GridView


                           }
                  );


                  activities[ $(activityEl).attr('name') ] = activityView;
                  activityView.collection.load();

                  
               }
      ); // _.each activity

      return activities;
   }


   // Private Functions

   function updateViewElement( elem, value ){
      if( $(elem).is('input') ){
         $(elem).val( value );
      } else {
         $(elem).html( value );
      }
      return elem;
   };

})





















