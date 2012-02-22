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

			shoppingCartPage : "shoppingCart.html",

			shoppingCartCheckoutPage : "shoppingCartCheckout.html",

			components : [
				'Search', 'Cart', 'Tree', 'List', 'Checkout'
			],

			initialize : function() {
				var that = this;
				/* render component if present in the page */
				_.each(this.components, function(component) {
					var namespaceTagFound = false;
					/* search the tag in the page */
					if ($("shoppingCart\\:" + component).length > 0) {
						namespaceTagFound = true;
						var componentContent = that['render' + component + 'Component']($("shoppingCart\\:" + component));
						$("shoppingCart\\:" + component).append(componentContent);
						/* execute script after adding to content to the dom */
						if (that['_executeAfterRender' + component + 'Component']) {
							that['_executeAfterRender' + component + 'Component']($("shoppingCart\\:" + component));
						}
					}
					/* search for class (old browsers support) */
					if (!namespaceTagFound && $(".shoppingCart-" + component).length > 0) {
						var componentContent = that['render' + component + 'Component']($(".shoppingCart-" + component));
						$(".shoppingCart-" + component).append(componentContent);
						/* execute script after adding to content to the dom */
						if (that['_executeAfterRender' + component + 'Component']) {
							that['_executeAfterRender' + component + 'Component']($(".shoppingCart-" + component));
						}

					}
				});

				expanz.CreateActivity($('[bind=activity]'));

			},

			renderSearchComponent : function(searchEl) {
				var displayButton = searchEl.attr('buttonVisible') != undefined ? boolValue(searchEl.attr('buttonVisible')) : true;
				var buttonLabel = searchEl.attr('buttonLabel') != undefined ? searchEl.attr('buttonLabel') : 'Search';
				if (buttonLabel.length == 0)
					buttonLabel = '&nbsp;';
				var html = '';
				html += '<div id="shoppingCartSearch" class="search">';
				html += window.expanz.html.renderField('ItemSearch', '', 'Search');
				html += window.expanz.html.renderMethod(this.searchMethodName, buttonLabel, null, !displayButton);
				html += "</div>";
				return html;
			},

			renderListComponent : function() {
				var html = '';
				html += '<div id="shoppingCartList" class="list">';
				html += window.expanz.html.renderMethod(this.listItemsOnSpecialMethodName, 'List Items On Special', this.listItemsOnSpecialMethodContextObject);

				html += '\
			<script type="text/template" id="productListItemTemplate"> \
				<div class="item"> \
					<div> \
					<% if ( isImageValid(data.ThumbImage_FileContents) ){ %>  \
						<img class="thumbnail" src="' + window.config._URLblobs + '<%= data.ThumbImage_FileContents %>' + '"/> \
					<% } %>  \
					<% if ( !isImageValid(data.ThumbImage_FileContents) ){ %>  \
						<img class="noThumbnail" src="assets/images/no_image_available.png"/> \
					<% } %> \
					<div style="min-height:100px"> \
						<label><%= data.Name %></label><br/> \
						<label><b>$<%= data.DefaultSellPrice %></b></label><br/> \
						<label><%= window.expanz.html.getDisplayableDiscount(data.UdefString1) %></label> \
					</div> \ \
					<% if ( data.AvailableQuantity <= 0 ) { %>  \
						<% if ( data.SellRateCalcNotes == "No stock available" ) { %>  \
						<i><%= $.i18n.prop(data.SellRateCalcNotes,data.Available_From)%></i> \
						<% } %>  \
						<% if ( data.SellRateCalcNotes != "Not available before" ) { %>  \
							<i><%= $.i18n.prop(data.SellRateCalcNotes)%></i> \
							<% } %>  \
					<% } %>  \
					<% if ( true ) { %>  \
						<button methodName="saveItemFromCart">Add to cart</button> \
					<% } %></div> \
			';

				html += window.expanz.html.clearBoth();

				html += '<div class="description"><label><%= data.ShortDescription %></label></div>';

				html += '</div>';
				html += '</script>';

				html += '<div id="productListDiv"  itemsPerPage="9" name="' + this.productListName + '" bind="DataControl" renderingType="grid" populateMethod="' + this.productListPopMethod + '" autoPopulate="0" contextObject="' + this.productListContextObject + '"></div>';

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
				return '<div id="categoriesTree" name="' + this.categoryTreeName + '"  bind="DataControl" renderingType="tree" populateMethod="' + this.categoryTreePopMethod + '" type="recursiveList" contextObject="' + this.categoryTreeContextObject + '" class="tree"></div>';
			},

			_executeAfterRenderTreeComponent : function() {
				var that = this;
				$("#categoriesTree").KendoTreeAdapter({
					labelAttribute : 'value'
				});
			},

			renderCartComponent : function() {
				var html = '';
				html += '<script type="text/template" id="lvMiniCartItemTemplate">';
				html += window.expanz.html.startDiv("item");
				html += window.expanz.html.renderGridTemplateField("ItemForSale_Name", 200);
				html += window.expanz.html.renderGridTemplateField("ValueIncTax", 40);
				html += '<input id="userinput_quantity" format="numeric" value="<%= data.PlanQuantity %>" />';
				html += '<button methodName="saveItemFromCart">Adjust</button>';
				html += '<button methodName="deleteItemFromCart">X</button>';
				html += window.expanz.html.endDiv();
				html += '</script>';

				html += "<div class='cart'>";
				html += "<div class='title'>Shopping cart</div>";
				html += "<div bind='DataControl' renderingType='grid' id='lvMiniCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";
				html += "<br/>";
				html += "<div style='display:none' id='cartCheckout' class='cartCheckout'>";
				html += window.expanz.html.renderReadOnlyField("Total", true);
				html += window.expanz.html.renderReadOnlyField("Freight", true);
				html += window.expanz.html.renderReadOnlyField("Total2", true);
				html += "<br/>";
				html += '<button onclick="window.location=\'' + this.shoppingCartCheckoutPage + '\'">Go to Checkout</button>';
				html += "</div>";

				html += "</div>";
				return html;

			},

			_executeAfterRenderCartComponent : function() {
				$("#lvMiniCart").bind("table:rendered", function() {
					$("#lvMiniCart").find("[id*='_userinput_'][format='numeric']").each(function() {
						$(this).kendoNumericTextBox({
							min : 1,
							max : 100,
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
				html += window.expanz.html.renderBasicGridTemplate('lvMiniCartItemTemplate', [
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

				html += window.expanz.html.renderHeaderGridField('Item', 300);
				html += window.expanz.html.renderHeaderGridField('Price', 100);
				html += window.expanz.html.renderHeaderGridField('Qty', 100);
				html += window.expanz.html.renderHeaderGridField('Value', 100);
				html += window.expanz.html.renderHeaderGridField('Total', 100);
				html += window.expanz.html.clearBoth();

				html += "<div bind='DataControl' renderingType='grid' id='checkoutCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";
				html += "<br/>";

				html += "<div style='display:none' id='cartCheckout' class='checkout'>";
				html += window.expanz.html.renderFooterGridField('&nbsp;', 400);
				html += window.expanz.html.renderFooterGridField('Freight', 100);
				html += window.expanz.html.renderReadOnlyField("Freight", false, true, 100);
				html += window.expanz.html.renderFooterGridField('&nbsp;', 400);
				html += window.expanz.html.renderFooterGridField('Total', 100);
				html += window.expanz.html.renderReadOnlyField("Total", false, true, 100);
				html += window.expanz.html.clearBoth();
				html += "<br/><div>";

				html += '<span><button id="gotoCart" type="button" onclick="window.location=\'' + this.shoppingCartPage + '\'">Edit cart</button></span>';
				html += window.expanz.html.renderMethod("Checkout", "Pay now");

				return html;
			},

			_executeAfterRenderCheckoutComponent : function() {
				$("#checkoutCart").bind("table:rendered", function() {
					$("#checkoutCart").find("[id*='_userinput_'][format='numeric']").each(function() {
						$(this).kendoNumericTextBox({
							min : 1,
							max : 100,
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

			_executeAfterRenderSearchComponent : function() {
				$("#shoppingCartSearch #ItemSearch input").keypress(function(e) {
					if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
						$("#shoppingCartSearch #ItemSearch input").blur(); /* send the search value to the server */
						$('#shoppingCartSearch button').click();
						return false;
					}
					else {
						return true;
					}
				});
			}

		});

	/*
	 * static html rendering functions
	 */
	window.expanz.html = window.expanz.html || {};
	window.expanz.html.renderBasicGridTemplate = function(templateId, columns) {
		var html = '';
		html += '<script type="text/template" id="' + templateId + '">';
		html += window.expanz.html.startDiv("item");
		$.each(columns, function() {
			html += window.expanz.html.renderGridTemplateField(this.name, this.width);
		});
		html += window.expanz.html.endDiv();
		html += window.expanz.html.clearBoth();
		html += '</script>';
		return html;
	};

	window.expanz.html.startDiv = function(className) {
		return '<div class="' + className + '" >';
	};

	window.expanz.html.endDiv = function(className) {
		return '</div>';
	};

	window.expanz.html.clearBoth = function(className) {
		return '<div style="clear:both"></div>';
	};

	window.expanz.html.renderHeaderGridField = function(label, width) {
		if (!width)
			width = 100;
		return '<div class="gridHeader" style="width:' + width + 'px;float:left">' + label + '</div>';
	};

	window.expanz.html.renderFooterGridField = function(label, width) {
		if (!width)
			width = 100;
		return '<div class="gridFooter" style="width:' + width + 'px;float:left">' + label + '</div>';
	};

	window.expanz.html.renderGridTemplateField = function(fieldName, width) {
		if (!width)
			width = 100;
		return '<div style="width:' + width + 'px;float:left"><%= data.' + fieldName + ' %>&nbsp;</div>';
	};

	window.expanz.html.renderField = function(fieldName, showLabel, prompt) {
		var field = '';
		field += '<div id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field">';
		if (showLabel === true)
			field += '<label attribute="label"></label>';
		field += '<input type="text" attribute="value"  class="k-textbox" placeholder="' + prompt + '"/>';
		field += '</div>';
		return field;
	};

	window.expanz.html.renderReadOnlyField = function(fieldName, showLabel, sameLine, width) {
		var field = '';
		var style = sameLine ? 'float:left;' : '';
		style += width ? 'width:' + width + 'px' : '';
		field += '<div style="' + style + '" id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field">';
		if (showLabel === true)
			field += '<div style="float:left"><label attribute="label"></label></div> ';
		field += '<div><label attribute="value"></label></div><div style="clear:both" ></div>';
		field += '</div>';
		return field;
	};

	window.expanz.html.renderMethod = function(methodName, buttonLabel, contextObject, hidden) {
		var method = '';
		var ctx = contextObject ? ' contextObject = "' + contextObject + '" ' : '';
		var visible = hidden ? ' style="display:none" ' : '';
		method += '<span bind="method" id="' + methodName + '" name="' + methodName + '" ' + ctx + visible + ' class="method">';
		method += '<button type="button" attribute="submit" >' + buttonLabel + '</button>';
		method += '</span>';
		return method;
	};

	window.expanz.html.getDisplayableDiscount = function(discount) {
		discount = discount.replace(/;/g, "<br/>");
		discount = discount.replace(/(\d*) @(\d*)/g, '<label class="discount">$1 items for &#36;$2</label>')
		return discount;
	};

	window.expanz.html.submitLostPasswordForm = function(loginCode, EmailAdress) {
		var xml = '\
			<Activity id="ERP.Person"> \
				<Delta id="LoginCode" value="' + loginCode + '" /> \
				<Delta id="EmailAddress" value="' + EmailAdress + '" /> \
				<Method name="resetMyPasswordAnon"> \
				</Method> \
			</Activity> \
			';
		window.expanz.Net.CreateAnonymousRequest(xml, {
			error : expanz._error,
			info : expanz._info
		});
	}

	window.expanz.html.showLostPasswordPopup = function() {
		var clientMessage = new expanz.Model.ClientMessage({
			id : 'lostPasswordPopup',
			title : 'Lost password',
			url : 'lostPassword.html'
		});

		var lostPwdPopup = new window.expanz.Views.UIMessage({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));
	}

});
