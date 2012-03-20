/* Author: Kim Damevin

 */
$(function() {

	window.expanz = window.expanz || {};
	window.expanz.ShoppingCart = Backbone.View
		.extend({

			listItemsOnSpecialMethodName : "listItemsOnSpecial",
			listItemsOnSpecialMethodContextObject : "StockTranItem.ItemForSale",

			listPreviouslyOrderedMethodName : "listItemsPreviouslyOrdered",
			listPreviouslyOrderedContextObject : "StockTranItem.ItemForSale",

			productListName : "productList",
			productListPopMethod : 'listItemsForCategoryFiltered',
			productListContextObject : "StockTranItem",

			orderHistoryListName : "listOrderHistory",
			orderHistoryPopMethod : 'listOrderHistory',
			orderHistoryContextObject : "StockTranItem",

			categoryTreeName : "StockTranItem.ItemForSale.ItemCategory.PersistentId",
			categoryTreePopMethod : '$custom',
			categoryTreeContextObject : "StockTranItem.ItemForSale.ItemCategory",

			miniCartName : "lvMiniCart",
			miniCartContextObject : "StockTranItem",

			searchMethodName : "StockTranItem.listMatchingItems",

			shoppingCartPage : "shoppingCart.html",

			shoppingCartCheckoutPage : "shoppingCartCheckout.html",

			components : [
				'Search',
				'AdvancedSearch',
				'Cart',
				'Tree',
				'List',
				'Checkout',
				'ListOnSpecialItemsButton',
				'ListPreviouslyOrderedButton',
				'ListItemsAsList',
				'ListItemsAsGrid',
				'ListDisplayChoice',
				'CartTitle',
				'CartItemsList',
				'CartTotals',
				'CartCheckoutButton',
				'CheckoutDeliveryAddress',
				'CheckoutItemsList',
				'CheckoutEditCartButton',
				'CheckoutPayNowButton',
				'CheckoutTotals',
				'OrderHistory'
			],

			initialize : function() {
				var that = this;
				/* render component if present in the page */
				_.each(this.components, function(component) {
					var componentEl = window.expanz.html.findShoppingCartElement(component);
					if (componentEl !== undefined) {
						var componentContent = that['render' + component + 'Component'](componentEl);
						$(componentEl).append(componentContent);
					}
				});

				expanz.CreateActivity($('[bind=activity]'));

				_.each(this.components, function(component) {
					var componentEl = window.expanz.html.findShoppingCartElement(component);
					if (componentEl !== undefined) {
						/* execute script after adding to content to the dom */
						if (that['_executeAfterRender' + component + 'Component']) {
							that['_executeAfterRender' + component + 'Component'](componentEl);
						}
					}
				});

			},

			/**
			 * Renders the Search component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:search&gt; or &lt;div class='shoppingCart-Search'&gt;
			 * </pre>
			 * 
			 * Tag parameters:
			 * 
			 * @param buttonVisible
			 *           boolean, display or not the search button (Default is true)
			 * @param buttonLabel
			 *           string, label of the search button (Default is Search)
			 * @param buttonLabel
			 *           string, prompt of the search input (Default is Search)
			 * @return html code
			 */
			renderSearchComponent : function(searchEl) {
				var displayButton = searchEl.attr('buttonVisible') !== undefined ? boolValue(searchEl.attr('buttonVisible')) : true;
				var inputPrompt = searchEl.attr('inputPrompt') !== undefined ? searchEl.attr('inputPrompt') : 'Search';
				var buttonLabel = searchEl.attr('buttonLabel') !== undefined ? searchEl.attr('buttonLabel') : 'Search';
				if (buttonLabel.length === 0)
					buttonLabel = '&nbsp;';
				var html = '';
				html += '<div id="shoppingCartSearch" class="search">';
				html += window.expanz.html.renderField('ItemSearch', '', inputPrompt);
				html += window.expanz.html.renderMethod(this.searchMethodName, buttonLabel, null, !displayButton);
				html += "</div>";
				return html;
			},

			/**
			 * Renders the Advanced Search component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:AdvancedSearch&gt; or &lt;div class='shoppingCart-AdvancedSearch'&gt;
			 * </pre>
			 * 
			 * @return html code
			 */
			renderAdvancedSearchComponent : function(searchEl) {
				var html = '';
				html += '<div id="shoppingCartAdvancedSearch" class="advancedSearch">';
				html += "Not implemented on the default component"
				html += "</div>";
				return html;
			},

			/**
			 * Method used in the list component to render the items on special button
			 */
			renderListOnSpecialItemsButtonComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'List Items On Special';
				html += window.expanz.html.renderMethod(this.listItemsOnSpecialMethodName, label, this.listItemsOnSpecialMethodContextObject);
				return html
			},

			renderListPreviouslyOrderedButtonComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'List Previously Ordered Items';
				html += window.expanz.html.renderMethod(this.listPreviouslyOrderedMethodName, label, this.listPreviouslyOrderedContextObject);
				return html
			},

			renderListItemsAsListComponent : function(el) {
				var html = "";
				var itemsPerPage = (el !== undefined && el.attr('itemsPerPage') !== undefined) ? el.attr('itemsPerPage') : 9;
				html += this.renderListItemTemplate();
				html += '<div id="productListDivList" templateName="productListItemTemplateList"  itemsPerPage="' + itemsPerPage + '" name="' + this.productListName + '" bind="DataControl" renderingType="grid" populateMethod="' + this.productListPopMethod + '" autoPopulate="0" contextObject="' + this.productListContextObject + '"></div>';
				return html
			},

			_executeAfterRenderListItemsAsListComponent : function() {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($("#productListDivList"), 1);
			},

			renderListItemsAsGridComponent : function(el) {
				var html = "";
				var itemsPerPage = (el !== undefined && el.attr('itemsPerPage') !== undefined) ? el.attr('itemsPerPage') : 9;
				html += this.renderListItemGridTemplate();
				html += '<div id="productListDivGrid" templateName="productListItemTemplateGrid" itemsPerPage="' + itemsPerPage + '" name="' + this.productListName + '" bind="DataControl" renderingType="grid" populateMethod="' + this.productListPopMethod + '" autoPopulate="0" contextObject="' + this.productListContextObject + '"></div>';
				return html
			},

			_executeAfterRenderListItemsAsGridComponent : function() {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($("#productListDivGrid"), 1);
			},

			renderListDisplayChoiceComponent : function(el) {
				var html = "";
				var labelList = (el !== undefined && el.attr('labelList') !== undefined) ? el.attr('labelList') : 'List display';
				var labelGrid = (el !== undefined && el.attr('labelGrid') !== undefined) ? el.attr('labelGrid') : 'Grid display';
				html += "<a id='displayAsList' href='#' class='itemsDisplay' >" + labelList + "</a><span class='itemsDisplay' style='margin-left:10px;margin-right:10px'> | </span>";
				html += "<a id='displayAsGrid' href='#' class='itemsDisplay'>" + labelGrid + "</a>";
				return html
			},

			_executeAfterRenderListDisplayChoiceComponent : function() {
				// TODO store and retrieve a user preference
				if ($("#productListDivList").length > 0) {
					$("#displayAsList").addClass("selectedDisplay");
					$("#productListDivList").show();
					$("#productListDivGrid").hide();
				}
				else {
					$("#displayAsGrid").addClass("selectedDisplay");
					$("#productListDivGrid").show();
					$("#productListDivList").hide();
				}

				var that = this;
				$("#displayAsList").click(function() {
					$("#displayAsList").addClass("selectedDisplay");
					$("#displayAsGrid").removeClass("selectedDisplay");
					$("#productListDivList").show();
					$("#productListDivGrid").hide();
				});

				$("#displayAsGrid").click(function() {
					$("#displayAsList").removeClass("selectedDisplay");
					$("#displayAsGrid").addClass("selectedDisplay");
					$("#productListDivList").hide();
					$("#productListDivGrid").show();
				});

			},

			/**
			 * Method used in the list component to render the template of an item in the grid
			 */
			renderListItemGridTemplate : function() {
				var html = '';
				html += '\
					<script type="text/template" id="productListItemTemplateGrid"> \
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
								<button class="addToCartButton" methodName="saveItemFromCart">Add</button> \
							<% } %></div> \
					';

				html += window.expanz.html.clearBoth();

				html += '<div class="description"><label><%= data.ShortDescription %></label></div>';

				html += '</div>';
				html += '</script>';

				return html;
			},

			/**
			 * Method used in the list component to render the template of an item in the list
			 */
			renderListItemTemplate : function(addToCartLabel) {
				var html = '';
				html += '\
					<script type="text/template" id="productListItemTemplateGrid"> \
						<div class="itemAsList"> \
							<div> \
							<% if ( isImageValid(data.ThumbImage_FileContents) ){ %>  \
								<img class="thumbnail" src="' + window.config._URLblobs + '<%= data.ThumbImage_FileContents %>' + '"/> \
							<% } %>  \
							<% if ( !isImageValid(data.ThumbImage_FileContents) ){ %>  \
								<img class="noThumbnail" src="assets/images/no_image_available.png"/> \
							<% } %> \
								<label><%= data.Name %></label><br/> \
								<label><b>$<%= data.DefaultSellPrice %></b></label><br/> \
								<label><%= window.expanz.html.getDisplayableDiscount(data.UdefString1) %></label> \
							<% if ( data.AvailableQuantity <= 0 ) { %>  \
								<% if ( data.SellRateCalcNotes == "No stock available" ) { %>  \
								<i><%= $.i18n.prop(data.SellRateCalcNotes,data.Available_From)%></i> \
								<% } %>  \
								<% if ( data.SellRateCalcNotes != "Not available before" ) { %>  \
									<i><%= $.i18n.prop(data.SellRateCalcNotes)%></i> \
									<% } %>  \
							<% } %>  \
							<% if ( true ) { %>  \
								<button class="addToCartButton" methodName="saveItemFromCart">' + addToCartLabel + '</button> \
							<% } %></div> \
					';

				html += '<span class="description"><label><%= data.ShortDescription %></label></span>';

				html += '</div>';
				html += '</script>';

				return html;
			},

			/**
			 * Renders the Items list component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:list&gt; or &lt;div class='shoppingCart-List'&gt;
			 * </pre>
			 * 
			 * Tag parameters:
			 * 
			 * @param addToCartLabel
			 *           string, label of the search button (Default is Add to cart)
			 * @param itemsPerPage
			 *           integer, number of items per page on the list/grid view (Default is 9)
			 * @return html code
			 */
			renderListComponent : function(listEl) {

				var html = '';
				html += '<div id="shoppingCartList" class="list">';

				html += this.renderListOnSpecialItemsButtonComponent();

				html += this.renderListItemsAsGridComponent();

				html += "</div>";
				return html;
			},

			_executeAfterRenderListComponent : function() {
				this._executeAfterRenderListItemsAsGridComponent();
				this._executeAfterRenderListDisplayChoiceComponent();
			},

			/**
			 * Renders the Categories tree component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:tree&gt; or &lt;div class='shoppingCart-Tree'&gt;
			 * </pre>
			 * 
			 * Tag parameters:
			 * 
			 * @return html code
			 */
			renderTreeComponent : function(treeEl) {
				return '<div id="categoriesTree" name="' + this.categoryTreeName + '"  bind="DataControl" renderingType="tree" populateMethod="' + this.categoryTreePopMethod + '" type="recursiveList" contextObject="' + this.categoryTreeContextObject + '" class="tree"></div>';
			},

			_executeAfterRenderTreeComponent : function() {
				var that = this;
				$("#categoriesTree").KendoTreeAdapter({
					labelAttribute : 'value'
				});
			},

			renderCartTitleComponent : function(el) {
				var html = "";
				html += "<div class='title'>Shopping cart</div>";
				return html
			},

			renderCartItemsListComponent : function(el) {
				var html = "";
				html += '<script type="text/template" id="lvMiniCartItemTemplate">';
				html += window.expanz.html.startDiv("item");
				html += window.expanz.html.renderGridTemplateField("ItemForSale_Name", 200);
				html += window.expanz.html.renderGridTemplateField("ValueIncTax", 55);
				html += '<input id="userinput_quantity" format="numeric" value="<%= data.PlanQuantity %>" />';
				html += '<button methodName="saveItemFromCart">Adjust</button>';
				html += '<button methodName="deleteItemFromCart">X</button>';
				html += window.expanz.html.endDiv();
				html += '</script>';
				html += "<div bind='DataControl' renderingType='grid' id='lvMiniCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";
				return html
			},

			_executeAfterRenderCartItemsListComponent : function() {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($("#lvMiniCart"));
			},

			renderCartTotalsComponent : function(el) {
				var html = "";
				html += "<div style='display:none' id='cartTotals' class='cartTotals'>";
				html += window.expanz.html.renderReadOnlyField("Total", true);
				html += window.expanz.html.renderReadOnlyField("Freight", true);
				html += window.expanz.html.renderReadOnlyField("Total2", true);
				html += "</div>";
				return html
			},

			renderCartCheckoutButtonComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Go to Checkout';
				html += '<button id="cartCheckout" onclick="window.location=\'' + this.shoppingCartCheckoutPage + '\'">' + label + '</button>';
				return html
			},

			_executeAfterRenderCartCheckoutButtonComponent : function() {
				$("#lvMiniCart").bind("table:rendered", function() {

					/* hiding the checkout part if no items */
					if ($("#lvMiniCart > [nbItems]").attr("nbItems") === "0") {
						$("#cartCheckout").hide();
						$("#cartTotals").hide();
					}
					else {
						$("#cartCheckout").show();
						$("#cartTotals").show();
					}
				});
			},

			/**
			 * Renders the Cart component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:cart&gt; or &lt;div class='shoppingCart-Cart'&gt;
			 * </pre>
			 * 
			 * Tag parameters:
			 * 
			 * @return html code
			 */
			renderCartComponent : function(cartEl) {
				var html = '';

				html += "<div class='cart'>";
				html += this.renderCartTitleComponent();
				html += this.renderCartItemsListComponent();
				html += "<br/>";

				html += this.renderCartTotalsComponent();
				html += this.renderCartCheckoutButtonComponent();

				html += "</div>";
				return html;

			},

			_executeAfterRenderCartComponent : function() {
				this._executeAfterRenderCartCheckoutButtonComponent();
				this._executeAfterRenderCartItemsListComponent();
			},

			renderCheckoutItemsListComponent : function(checkoutEl) {
				var html = ""
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

				html += "<div class='title'>Checkout</div>";

				html += "<div class='checkoutList'>";
				html += window.expanz.html.renderHeaderGridField('Item', 300);
				html += window.expanz.html.renderHeaderGridField('Price', 100);
				html += window.expanz.html.renderHeaderGridField('Qty', 100);
				html += window.expanz.html.renderHeaderGridField('Value', 100);
				html += window.expanz.html.renderHeaderGridField('Total', 100);
				html += window.expanz.html.clearBoth();
				html += "<div bind='DataControl' renderingType='grid' id='checkoutCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";

				html += "</div>";

				return html;

			},

			renderCheckoutDeliveryAddressComponent : function(checkoutEl) {
				var html = "";

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
				return html;
			},

			renderCheckoutTotalsComponent : function(checkoutEl) {
				var html = "";
				html += "<div style='display:none'  id='cartCheckout' class='checkout'>";
				html += window.expanz.html.renderFooterGridField('&nbsp;', 400);
				html += window.expanz.html.renderFooterGridField('Freight', 100);
				html += window.expanz.html.renderReadOnlyField("Freight", false, true, 100);
				html += window.expanz.html.renderFooterGridField('&nbsp;', 400);
				html += window.expanz.html.renderFooterGridField('Total', 100);
				html += window.expanz.html.renderReadOnlyField("Total", false, true, 100);
				html += window.expanz.html.clearBoth();
				html += "<div>";
				return html;
			},

			renderCheckoutEditCartButtonComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Edit cart';
				html += '<span><button id="gotoCart" type="button" onclick="window.location=\'' + this.shoppingCartPage + '\'">' + label + '</button></span>';
				return html;
			},

			renderCheckoutPayNowButtonComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Pay now';
				html += window.expanz.html.renderMethod("Checkout", label);
				return html;
			},

			// renderCheckoutListItemsComponent : function(checkoutEl) {
			// var html = "";
			//
			// return html;
			// },

			/**
			 * Renders the checkout component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:checkout&gt; or &lt;div class='shoppingCart-Checkout'&gt;
			 * </pre>
			 * 
			 * Tag parameters:
			 * 
			 * @return html code
			 */
			renderCheckoutComponent : function(checkoutEl) {

				var html = '';

				html += "<div class='checkout'>";
				html += this.renderCheckoutDeliveryAddressComponent();
				html += this.renderCheckoutItemsListComponent();
				html += this.renderCheckoutTotalsComponent();
				html += this.renderCheckoutEditCartButtonComponent();
				html += this.renderCheckoutPayNowButtonComponent();
				html += "</div>";
				return html;
			},

			_executeAfterRenderCheckoutComponent : function() {
				this._executeAfterRenderCheckoutListItemsComponent();
			},

			_executeAfterRenderCheckoutItemsListComponent : function() {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($("#checkoutCart"));

				$("#checkoutCart").bind("table:rendered", function() {
					/* hiding the checkout part if no items */
					if ($("#checkoutCart > [nbItems]").attr("nbItems") === "0") {
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
			},

			renderOrderHistoryComponent : function(el) {
				var html = "";
				var itemsPerPage = (el !== undefined && el.attr('itemsPerPage') !== undefined) ? el.attr('itemsPerPage') : 9;
				html += '<div id="orderHistoryDivList" itemsPerPage="' + itemsPerPage + '" name="' + this.orderHistoryListName + '" bind="DataControl" renderingType="grid" contextObject="' + this.orderHistoryContextObject + '"></div>';
				return html
			},

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
		return '<div class="' + fieldName + '" style="width:' + width + 'px;float:left"><%= data.' + fieldName + ' %>&nbsp;</div>';
	};

	window.expanz.html.renderField = function(fieldName, showLabel, prompt) {
		var field = '';
		field += '<div id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field ' + fieldName + '">';
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
		field += '<div style="' + style + '" id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="readonlyField ' + fieldName + '">';
		if (showLabel === true)
			field += '<div class="fieldLabel" style="float:left"><label attribute="label"></label></div> ';
		field += '<div class="fieldValue"><label attribute="value"></label></div><div style="clear:both" ></div>';
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
		window.expanz.Net.CreateAnonymousRequest(xml);
	}

	window.expanz.html.findShoppingCartElement = function(component) {
		if ($("shoppingCart\\:" + component).length > 0) {
			return $("shoppingCart\\:" + component);
		}

		/* search for class (old browsers support) */
		if ($(".shoppingCart-" + component).length > 0) {
			return $(".shoppingCart-" + component);
		}

		return undefined;

	}

	window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent = function(hostEl, initValue, min, max) {
		if (min === undefined)
			min = 1;
		if (max === undefined)
			max = 100;
		$(hostEl).bind("table:rendered", function() {
			$(hostEl).find("[id*='_userinput_'][format='numeric']").each(function() {
				if (initValue === undefined) {
					$(this).kendoNumericTextBox({
						min : min,
						max : max,
						step : 1,
						format : "n0"
					});
				}
				else {
					$(this).kendoNumericTextBox({
						value : initValue,
						min : min,
						max : max,
						step : 1,
						format : "n0"
					});
				}
			});

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
