////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Kim Damevin, Chris Anderson, Stephen Neander
//  Copyright 2008-2012 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////
$(function () {

    window.expanz = window.expanz || {};
    window.expanz.views = window.expanz.views || {};

    window.expanz.views.PicklistWindowView = window.expanz.views.PopupView.extend({
        divAttributes: " bind='DataControl' renderingType='grid' ",
        
        cssClass: 'pickListPopup popupView',
        
        initialize: function(attrs, $container) {
            window.expanz.views.PopupView.prototype.initialize.call(this, attrs, $container);
            
            // Centre the window once the pick list has rendered, and its size has been determined
            this.$el.on("datapublication:rendered", $.proxy(function(event, dataPublicationModel, dataPublicationView) {
                this.center();

                var picklistWindowView = this;
                
                // Redefine the data publication view's onRowClicked event handler function
                dataPublicationView.onRowClicked = function ($row) {
                    picklistWindowView.onItemSelected(dataPublicationModel, $row.attr("id"), $row.attr("type"));
                    picklistWindowView.close();
                };
            }, this));
        },
        
        onItemSelected: function (dataPublicationModel, selectedId, type) {
            // An item from the pick list has been selected, so send the context to the server
            var clientFunction = window["picklistUpdateRowSelected" + type];

            if (typeof(clientFunction) == "function") {
                clientFunction(selectedId);
            } else {
                dataPublicationModel.sendContextToServer(selectedId, type);
            }
        }
    });
});
