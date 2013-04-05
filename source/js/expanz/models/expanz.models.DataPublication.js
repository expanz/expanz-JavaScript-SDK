////////////////////////////////////////////////////////////////////////////////
//
//  EXPANZ
//  Author: Chris Anderson
//  Copyright 2008-2013 EXPANZ
//  All Rights Reserved.
//
//  NOTICE: expanz permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

$(function () {

    window.expanz = window.expanz || {};
    window.expanz.models = window.expanz.models || {};

    window.expanz.models.DataPublication = Backbone.Model.extend({

        initialize: function () {
            this.rows = new expanz.models.data.RowCollection();
            this.columns = new expanz.Collection();

            this.rows.dataPublication = this;
            this.columns.dataPublication = this;

            this.hasActions = false;
            this.isEditable = false;
        },

        addColumn: function (id, field, label, datatype, width, isEditable, matrixKey) {
            // Create a "safe" field name, replacing periods with underscores
            var safeFieldName = field || id;
            safeFieldName = safeFieldName.replace(/\./g, "_");
            
            this.columns.add({
                id: id,
                field: field,
                safeFieldName: safeFieldName,
                label: label,
                datatype: datatype,
                width: width,
                isEditable: isEditable,
                matrixKey: matrixKey
            });

            return this.columns.get(id);
        },

        addRow: function (id, type, displayStyle) {
            this.rows.add({
                id: id,
                type: type,
                displayStyle: displayStyle,
                gridId: this.id
            });

            var row = this.rows.get(id);
            row.dataPublication = this;

            return row;
        },

        sortRowsByFieldName: function (fieldName, inAscendingOrder) {
            this.rows.comparator = function (compareRow) {
                return compareRow.getCellValues().sortValues[fieldName] || "";
            };

            this.rows.sort();

            if (!inAscendingOrder)
                this.rows.models.reverse();
        },
        
        sendContextToServer: function (selectedId, type) {
            var contextInfo = this._getContextInfoObject(selectedId, type);

            var methodAttributes = [];

            if (this.contextObject) {
                methodAttributes.push(
                    {
                        name: "contextObject",
                        value: this.contextObject
                    });
            }

            expanz.net.MethodRequest('SetIdFromContext', methodAttributes, contextInfo, this.get("parent"));
        },
        
        sendCellUpdateToServer: function (cellModel, newValue) {
            var contextInfo = this._getContextInfoObject(cellModel.row.id, cellModel.row.get("type"));
            
            var deltaInfo = {
                id: cellModel.column.get("field"),
                value: newValue,
                matrixKey: cellModel.column.get("matrixKey")
            };

            expanz.net.SetContextAndDeltaRequest(contextInfo, deltaInfo, this.get("parent"));
        },
        
        _getContextInfoObject: function (selectedId, type) {
            var context = {
                id: selectedId,
                contextObject: this.contextObject,
                type: type
            };

            return context;
        },

        drillDown: function (selectedId, type, contextObject) {
            expanz.net.CreateMenuActionRequest(this.get("parent"), selectedId, type, contextObject, null, "1", false);
        },

        refresh: function () {
            expanz.net.DataRefreshRequest(this.id, this.get("parent"));
        }
    });
});
