/* Author: Kim Damevin

 */
$(function() {

	window.expanz = window.expanz || {};
	window.expanz.ShoppingCart = Backbone.View
		.extend({

			listItemsOnSpecialMethodName : "listItemsOnSpecial",
			listItemsOnSpecialMethodContextObject : "StockTranItem.ItemForSale",

			productListName : "productList",
			productListPopMethod : 'listItemsForCategoryFiltered',
			productListContextObject : "StockTranItem",

			categoryTreeName : "StockTranItem.ItemForSale.ItemCategory.PersistentId",
			categoryTreePopMethod : '$custom',
			categoryTreeContextObject : "StockTranItem.ItemForSale.ItemCategory",

			miniCartName : "lvMiniCart",
			miniCartContextObject : "StockTranItem",

			searchMethodName : "StockTranItem.listMatchingItems",

			components : [
				'Search', 'Cart', 'Tree', 'List', 'Checkout'
			],

			initialize : function() {
				var that = this;
				/* render component if present in the page */

				_.each(this.components, function(component) {
					/* search the tag in the page */
					if ($("shoppingCart\\:" + component).length > 0) {
						window.expanz.logToConsole("Rendering " + component);
						var componentContent = that['render' + component + 'Component']();
						$("shoppingCart\\:" + component).append(componentContent);
						/* execute script after adding to content to the dom */
						if (that['_executeAfterRender' + component + 'Component']) {
							window.expanz.logToConsole('executing:' + '_executeAfterRender' + component + 'Component');
							that['_executeAfterRender' + component + 'Component']();
						}
					}
					;
				});
				
				expanz.CreateActivity($('[bind=activity]'));

			},

			renderSearchComponent : function() {
				var html = '';
				html += '<div id="shoppingCartSearch" class="search">';
				html += this._renderField('ItemSearch');
				html += this._renderMethod(this.searchMethodName, 'Search');
				html += "</div>";
				return html;
			},

			renderListComponent : function() {
				var html = '';
				html += '<div id="shoppingCartList" class="list">';
				html += this._renderMethod(this.listItemsOnSpecialMethodName, 'List Items On Special', this.listItemsOnSpecialMethodContextObject);

				html += '\
			<script type="text/template" id="productListItemTemplate"> \
				<div class="item"> \
					<div> \
					<% if ( isImageValid(data.ThumbImage_FileContents) ){ %>  \
						<img class="thumbnail" src="' + window.config._URLblobs + '<%= data.ThumbImage_FileContents %>' + '"/> \
					<% } %>  \
					<% if ( !isImageValid(data.ThumbImage_FileContents) ){ %>  \
						<div class="noThumbnail">&nbsp;</div> \
					<% } %> \
					<div style="min-height:100px"> \
						<label><%= data.Name %></label><br/> \
						<label><b>$<%= data.DefaultSellPrice %></b></label><br/> \
						<label><%= data.UdefString1 %></label> \
					</div> \
					<% if ( data.SellRateCalcNotes == "No stock available" ) { %>  \
						<i>No stock</i> \
					<% } %>  \
					<% if ( data.SellRateCalcNotes != "No stock available" ) { %>  \
						<button methodName="saveItemFromCart">Add to cart</button> \
					<% } %></div> \
			';

				html += this._clearBoth();

				html += '<div class="description"><label><%= data.ShortDescription %></label></div>';

				html += '</div>';
				html += '</script>';

				html += '<div id="productListDiv" itemsPerPage="1000" name="' + this.productListName + '" bind="grid" populateMethod="' + this.productListPopMethod + '" contextObject="' + this.productListContextObject + '"></div>';

				html += "</div>";
				return html;
			},

			_executeAfterRenderListComponent : function() {
				$("#productListDiv").bind("table:rendered", function() {
					$("#productList").find("[id*='_userinput_'][format='numeric']").each(function() {
						$(this).kendoNumericTextBox({
							value : 1,
							min : 1,
							max : 10,
							step : 1,
							format : "n0"
						});
					});

				});
			},

			renderTreeComponent : function() {
				return '<div id="categoriesTree" name="' + this.categoryTreeName + '"  bind="DataControl" populateMethod="' + this.categoryTreePopMethod + '" type="recursiveList" contextObject="' + this.categoryTreeContextObject + '" class="tree"></div>';
			},

			_executeAfterRenderTreeComponent : function() {
				$("#categoriesTree").KendoTreeAdapter({
					labelAttribute : 'value',
					expandedOnLoad : true,
					selectionCallback : {
						success : function() {
							expanz.Net.MethodRequest('listItemsForCategoryFiltered', [
								{
									name : "contextObject",
									value : 'StockTranItem.ItemForSale'
								}
							], null, window.App[0].collection);
						},
						error : function(e) {
							window.expanz.logToConsole('error: ' + e);
						}
					}
				});
			},

			renderCartComponent : function() {
				var html = '';
				html += '<script type="text/template" id="lvMiniCartItemTemplate">';
				html += this._startDiv("item");
				html += this._renderGridTemplateField("ItemForSale_Name", 200);
				html += this._renderGridTemplateField("ValueIncTax", 40);
				html += '<input id="userinput_quantity" format="numeric" value="<%= data.PlanQuantity %>" />';
				html += '<button methodName="saveItemFromCart">Adjust</button>';
				html += '<button methodName="deleteItemFromCart">X</button>';
				html += this._endDiv();
				html += '</script>';

				html += "<div class='cart'>";
				html += "<div class='title'>Shopping cart</div>";
				html += "<div bind='grid' id='lvMiniCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";
				html += "<br/>";
				html += "<div style='display:none' id='cartCheckout' class='cartCheckout'>";
				html += this._renderReadOnlyField("Total", true);
				html += this._renderReadOnlyField("Freight", true);
				html += "<br/>";
				html += '<button onclick="window.location=\'shoppingCartCheckout.html\'">Go to Checkout</button>';
				html += "</div>";

				html += "</div>";
				return html;

			},

			_executeAfterRenderCartComponent : function() {
				$("#lvMiniCart").bind("table:rendered", function() {
					$("#lvMiniCart").find("[id*='_userinput_'][format='numeric']").each(function() {
						$(this).kendoNumericTextBox({
							min : 1,
							max : 10,
							step : 1,
							format : "n0"
						});
					});

					/* hiding the checkout part if no items */
					if ($("#lvMiniCart > [nbItems]").attr("nbItems") == 0) {
						$("#cartCheckout").hide();
					}
					else {
						$("#cartCheckout").show();
					}
				});
			},

			renderCheckoutComponent : function() {
				var html = '';
				html += this.renderBasicGridTemplate('lvMiniCartItemTemplate', [
					{
						name : 'ItemForSale_Name',
						width : 300
					}, {
						name : 'UnitPrice',
						width : 100
					}, {
						name : 'PlanQuantity',
						width : 100
					}, {
						name : 'Value',
						width : 100
					}, {
						name : 'ValueIncTax',
						width : 100
					}
				]);

				html += "<div class='checkout'>";

				html += '\
			<div class="deliveryAddress"> \
				<div class="title">Delivery Address</div> \
				<div bind="field" name="DeliveryAddressStreet" class="textinput"> \
					<label attribute="label"></label> \
					<input type="text" attribute="value" class="k-textbox" /> \
				</div> \
				<div bind="field" name="DeliveryLocation.ExtendedName" class="textinput"> \
					<label attribute="label"></label> \
					<span type="text" attribute="value" style="word-wrap:break-word" /> \
				</div> \
				<div bind="field" name="DeliveryLocation.FindCode" class="textinput indentOneLevel"> \
					<label attribute="label"></label> \
					<input type="text" attribute="value" class="k-textbox" /> \
				</div> \
			</div> \
			';

				html += "<div class='title'>Checkout</div>";

				html += this._renderHeaderGridField('Item', 300);
				html += this._renderHeaderGridField('Price', 100);
				html += this._renderHeaderGridField('Qty', 100);
				html += this._renderHeaderGridField('Value', 100);
				html += this._renderHeaderGridField('Total', 100);
				html += this._clearBoth();

				html += "<div bind='grid' id='checkoutCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";
				html += "<br/>";

				html += "<div style='display:none' id='cartCheckout' class='checkout'>";
				html += this._renderFooterGridField('&nbsp;', 400);
				html += this._renderFooterGridField('Freight', 100);
				html += this._renderReadOnlyField("Freight", false, true, 100);
				html += this._renderFooterGridField('&nbsp;', 400);
				html += this._renderFooterGridField('Total', 100);
				html += this._renderReadOnlyField("Total", false, true, 100);
				html += this._clearBoth();
				html += "<br/><div>";

				html += '<span><button id="gotoCart" type="button" onclick="window.location=\'shoppingCart.html\'">Edit cart</button></span>';
				html += this._renderMethod("Checkout", "Pay now");

				return html;
			},

			_executeAfterRenderCheckoutComponent : function() {
				$("#checkoutCart").bind("table:rendered", function() {
					$("#checkoutCart").find("[id*='_userinput_'][format='numeric']").each(function() {
						$(this).kendoNumericTextBox({
							min : 1,
							max : 10,
							step : 1,
							format : "n0"
						});
					});

					/* hiding the checkout part if no items */
					if ($("#checkoutCart > [nbItems]").attr("nbItems") == 0) {
						$("#cartCheckout").hide();
					}
					else {
						$("#cartCheckout").show();
					}
				});
			},

			renderBasicGridTemplate : function(templateId, columns) {
				var html = '';
				html += '<script type="text/template" id="' + templateId + '">';
				html += this._startDiv("item");
				var that = this;
				$.each(columns, function() {
					html += that._renderGridTemplateField(this.name, this.width);
				});
				html += this._endDiv();
				html += this._clearBoth();
				html += '</script>';
				return html;
			},

			/*
			 * private functions
			 */

			_startDiv : function(className) {
				return '<div class="' + className + '" >';
			},

			_endDiv : function(className) {
				return '</div>';
			},

			_clearBoth : function(className) {
				return '<div style="clear:both"></div>';
			},

			_renderHeaderGridField : function(label, width) {
				if (!width)
					width = 100;
				return '<div class="gridHeader" style="width:' + width + 'px;float:left">' + label + '</div>';
			},

			_renderFooterGridField : function(label, width) {
				if (!width)
					width = 100;
				return '<div class="gridFooter" style="width:' + width + 'px;float:left">' + label + '</div>';
			},

			_renderGridTemplateField : function(fieldName, width) {
				if (!width)
					width = 100;
				return '<div style="width:' + width + 'px;float:left"><%= data.' + fieldName + ' %> </div>';
			},

			_renderField : function(fieldName, showLabel) {
				var field = '';
				field += '<div id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field">';
				if (showLabel === true)
					field += '<label attribute="label"></label>';
				field += '<input type="text" attribute="value"  class="k-textbox"/>';
				field += '</div>';
				return field;
			},

			_renderReadOnlyField : function(fieldName, showLabel, sameLine, width) {
				var field = '';
				var style = sameLine ? 'float:left;' : '';
				style += width ? 'width:' + width + 'px' : '';
				field += '<div style="' + style + '" id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field">';
				if (showLabel === true)
					field += '<label attribute="label"></label> ';
				field += '<label attribute="value"></label>';
				field += '</div>';
				return field;
			},

			_renderMethod : function(methodName, buttonLabel, contextObject) {
				var method = '';
				var ctx = contextObject ? 'contextObject = "' + contextObject + '"' : '';
				method += '<span bind="method" id="' + methodName + '" name="' + methodName + '" ' + ctx + ' class="method">';
				method += '<button type="button" attribute="submit" >' + buttonLabel + '</button>';
				method += '</span>';
				return method;
			},

		});
});
