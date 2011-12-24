/* Author: Adam Tait

*/
$(function () {

   window.expanz = window.expanz || {};
   window.expanz.Views = {};

   window.expanz.Views.FieldView = Backbone.View.extend({

      initialize: function () {
         this.model.bind("change:label", this.modelUpdate('label'), this);
         this.model.bind("change:value", this.modelUpdate('value'), this);
      },

      modelUpdate: function (attr) {
         return function () {
            var elem = this.el.find('[attribute=' + attr + ']');
            updateViewElement(elem, this.model.attributes, attr);
            this.el.trigger('update:field');
         };
      },

      events: {
         "change [attribute=value]": "viewUpdate"
      },

      viewUpdate: function () {
         this.model.update({
            value: this.el.find('[attribute=value]').val()
         });
         this.el.trigger('update:field');
      }

   });

   window.expanz.Views.DependantFieldView = Backbone.View.extend({

      initialize: function () {
         this.model.bind("change:value", this.toggle, this);
         this.el.hide();
      },

      toggle: function () {
         var elem = this.el.find('[attribute=value]');
         updateViewElement(elem, this.model.get('value'));

         if (this.model.get('value').length > 0) {
            this.el.show('slow');
         } else {
            this.el.hide('slow');
         }
      }


   });

   window.expanz.Views.MethodView = Backbone.View.extend({

      events: {
         "click [attribute=submit]": "submit"
      },

      submit: function () {
         this.model.submit({success: this.options.callback});
         this.el.trigger('submit:' + this.model.get('id'));
      }

   });

   window.expanz.Views.GridView = Backbone.View.extend({

      initialize: function () {
         this.model.bind("add", this.render, this);
         this.model.bind("change", this.render, this);
      },

      render: function () {

         // set table scaffold
         var tableEl = this.el.find('table#' + this.model.getAttr('id'));
         if (tableEl.length < 1) {
            this.el.append('<table id="' + this.model.getAttr('id') + '"></table>');
            tableEl = this.el.find('table#' + this.model.getAttr('id'));
         }
         $(tableEl).html('<thead><tr></tr></thead><tbody></tbody>');

         // render column header
         var el = $(tableEl).find('thead tr');
         _.each(this.model.getAllColumns(), function (cell) {
            var html = '<td';
            html += cell.get('width') ? ' width="' + cell.get('width') + '"' : '';
            html += '>' + cell.get('label') + '</td>';
            el.append(html);
         });


         // render rows
         var model = this.model;
         el = $(tableEl).find('tbody');
         _.each(this.model.getAllRows(), function (row) {
            var html = '<tr id="' + row.getAttr('id') + '">';
            var columnOrder = _.map(this.model.getAllColumns(), function (cell) {
               return {
                  id: cell.get('id'),
                  field: cell.get('field'),
                  label: cell.get('label')
               };
            });
            _.each(row.getAllCells(columnOrder), function (cell) {
               html += '<td id="' + cell.get('id') + '" class="row' + row.getAttr('id') + ' column' + cell.get('id') + '">';
               if (model.getColumn(cell.get('id')) && model.getColumn(cell.get('id')).get('datatype') === 'BLOB') {
                  html += '<img width="' + model.getColumn(cell.get('id')).get('width') + '" src="' + cell.get('value') + '"/>';
               } else if (cell.get('value')) {
                  html += '<span>' + cell.get('value') + '</span>';
               }
               html += '</td>';
            }, row);
            html += '</tr>';
            el.append(html);
         }, this);

         return this;
      }
   });

   window.expanz.Views.ClientMessage = Backbone.View.extend({

      initialize: function( attrs, containerjQ){
         Backbone.View.prototype.initialize.call(attrs);
         this.create( containerjQ);
         this.delegateEvents( this.events);
      },

      events: {
         "click button":   "close"
      },

      create: function( containerjQ){
         containerjQ.append( '<div id="ExpanzClientMessage"></div>' );
         this.el = $('div#ExpanzClientMessage', containerjQ);
         
         this.el.append('<div id="title">'+ this.model.getAttr('title') +'</div>');
         this.el.append( '<div id="text">'+ this.model.getAttr('text') +'</div>' );

         this.model.each( function( action){
               if( action.id == 'close'){
                  this.el.append( '<div bind="method" name="close" id="close">' +
                                       '<button attribute="submit">' + action.get('label') + '</button>' +
                                    '</div>' );
               } else if ( action.id !== this.model.id) {
                  this.el.append( '<div bind="method" name="'+ action.id +'" id="'+ action.id +'">' +
                                       '<button attribute="submit">' + action.get('label') + '</button>' +
                                    '</div>' );
                  var methodView = new expanz.Views.MethodView({
                                    el: $('div#'+action.id, this.el),
                                    id: action.id,
                                    model: action
                                    });
               }
         }, this);
      },

      close: function(){
         this.remove();
      }
   });

      

   window.expanz.Views.ActivityView = Backbone.View.extend({

      initialize: function (attrs) {
         Backbone.View.prototype.initialize.call(attrs);
         if (attrs.key) {
            this.key = attrs.key;
         }
         this.collection.bind( "error", this.updateError, this );
      },

      updateError: function( model, error ){
         expanz._error( error );
      },

      events: {
         "update:field": "update"
      },

      update: function () {
         // perform full activity validation after a field updates ... if necessary
      }

   });

   // Public Functions
   window.expanz.Views.redirect = function (destinationURL) {
      window.location.href = destinationURL;
   };




   // Private Functions

   function updateViewElement(elem, allAttrs, attr) {
      var datatype = allAttrs['datatype'];
      if (datatype && datatype.toLowerCase() === 'blob' && attr && attr === 'value') {
         var width = allAttrs['width'];
         var imgElem = '<img src="' + allAttrs['value'] + '"';
         imgElem += width ? ' width="' + width + '"' : '';
         imgElem += '/>';
         $(elem).html(imgElem);
         return;
      }

      if ($(elem).is('input')) {
         $(elem).val(allAttrs[attr]);
      } else {
         $(elem).html(allAttrs[attr]);
      }
      return elem;
   };

})

