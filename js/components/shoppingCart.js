/* Author: Kim Damevin

 */
$(function() {

	window.expanz = window.expanz || {};
	window.expanz.ShoppingCart = Backbone.View
		.extend({

			activity : null, /* initialised when the activity is created */

			listItemsOnSpecialMethodName : "listItemsOnSpecial",
			listItemsOnSpecialMethodContextObject : "StockTranItem.ItemForSale",

			listPreviouslyOrderedMethodName : "listPreviouslyOrderedItemsIncludingSpecial",
			listPreviouslyOrderedContextObject : "StockTranItem.ItemForSale",

			productListName : "productList",
			productListPopMethod : 'listItemsForCategoryFiltered',
			productListContextObject : "StockTranItem",

			orderHistoryListName : "orderHistory",
			orderHistoryPopMethod : 'listMatchingOrders',
			orderHistoryContextObject : "",

			myStandardOrdersPopMethod : "listMyStandardOrders",
			myStandardOrdersContextObject : "",

			categoryTreeName : "StockTranItem.ItemForSale.ItemCategory.PersistentId",
			categoryTreePopMethod : '$custom',
			categoryTreeContextObject : "StockTranItem.ItemForSale.ItemCategory",
			categoryTreeSelectionChangeAnonymousMethod : "listItemsForCategoryFiltered",
			categoryTreeSelectionChangeAnonymousContextObject : "StockTranItem.ItemForSale",

			miniCartName : "lvMiniCart",
			miniCartContextObject : "StockTranItem",

			searchMethodName : "listMatchingItems",
			searchMethodContextObject : "StockTranItem",

			listDietaryClaimsMethodName : "listDietaryClaims",
			listDietaryClaimsContextObject : "StockTranItem.ItemForSale",

			listAllergensMethodName : "listAllergens",
			listAllergensContextObject : "StockTranItem.ItemForSale",

			listCountryOfOriginsMethodName : "listCountryOfOrigins",
			listCountryOfOriginsContextObject : "StockTranItem.ItemForSale",

			listCategoriesMethodName : "listCategories",
			listCategoriesContextObject : "StockTranItem.ItemForSale",

			shoppingCartPage : "shoppingCart.html",

			shoppingCartCheckoutPage : "shoppingCartCheckout.html",

			components : [
				'Search',
				'AdvancedSearchAllergensFilter',
				'AdvancedSearchDietaryClaimsFilter',
				'AdvancedSearchCountryOfOriginFilter',
				'AdvancedSearch',
				'Cart',
				'CategoriesTree',
				'CategoriesAccordion',
				'List',
				'ListOnSpecialItemsButton',
				'ListPreviouslyOrderedButton',
				'ListItems',
				'StandardOrdersList',
				'ListDisplayChoice',
				'CartTitle',
				'CartItemsList',
				'CartTotals',
				'CartCheckoutButton',
				'MiniGoToCartBox',
				'CheckoutDeliveryAddress',
				'CheckoutItemsList',
				'CheckoutEditCartButton',
				'CheckoutPayNowButton',
				'CheckoutPickupCheckbox',
				'CheckoutStandardOrder',
				'CheckoutSubTotal',
				'CheckoutTotalTaxAmount',
				'CheckoutFreight',
				'CheckoutTotal',
				'OrderHistory'
			],

			initialize : function() {
				var that = this;
				/* render component if present in the page */
				_.each(this.components, function(component) {
					var componentEl = window.expanz.html.findShoppingCartElement(component);
					if (componentEl !== undefined) {
						componentEl.each(function() {
							var componentContent = that['render' + component + 'Component']($(this));
							$(this).append(componentContent);
						});

					}
				});

				var activities = expanz.CreateActivity($('[bind=activity]'));
				if (activities !== undefined && activities.length > 0) {
					this.activity = activities[0];
					var that = this;
					var anonymousCalls = function() {
						if (that.isAnonymous()) {

							//console.log('Anonymous -> must call some stuff ');
							/* list of anonymous call we want to do at the beginning (data publication) */
							var dataModelList = [
								{
									name : that.listDietaryClaimsMethodName,
									contextObject : that.listDietaryClaimsContextObject
								}, {
									name : that.listAllergensMethodName,
									contextObject : that.listAllergensContextObject
								}, {
									name : that.listCategoriesMethodName,
									contextObject : that.listCategoriesContextObject
								}
							];

							$.each(dataModelList, function(index, value) {
								expanz.Net.MethodRequest(value.name, [
									{
										name : "contextObject",
										value : value.contextObject
									}
								], null, that.activity.collection);
							});

							/* hide unwanted stuff when anonymous */
							$("[loginNeeded='true']").hide();
							// $("#rightPart").hide();
							$("#logout a").hide();
							$("#logout").unbind("click");
							$("#logout").click(function() {
								expanz.Views.requestLogin();
							});

							$("#logout").append('<a class="login menuTitle">Login</a>');

						}
					};
					if (this.activity.collection.getAttr('loading') === false) {
						anonymousCalls();
					}
					else {
						this.activity.collection.bind("update:loading", function() {
							anonymousCalls();
						});
					}
				}

				_.each(this.components, function(component) {
					var componentEl = window.expanz.html.findShoppingCartElement(component);
					if (componentEl !== undefined) {
						componentEl.each(function() {
							/* execute script after adding to content to the dom */
							if (that['_executeAfterRender' + component + 'Component']) {
								that['_executeAfterRender' + component + 'Component']($(this));
							}
						});

					}
				});

				addPlaceHolderCapabilities();

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
				html += window.expanz.html.renderField('ItemSearch', '', inputPrompt, this.searchMethodName);
				html += window.expanz.html.renderMethod(this.searchMethodName, buttonLabel, this.searchMethodContextObject, !displayButton);
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
				html += this.renderAdvancedSearchDietaryClaimsFilter();
				html += this.renderAdvancedSearchAllergensFilter();
				html += this.renderAdvancedSearchCountryOfOriginFilter();
				html += "</div>";
				return html;
			},

			renderAdvancedSearchDietaryClaimsFilterComponent : function(el) {
				var html = "";
				html += '<div class="advancedSearchCategory">Dietary Claims</div><div id="filterSearchCheckboxesDivDietaryClaims"  templateName="filterSearchCheckboxesTemplate" name="DietaryClaimsSearchDP" fieldName="DietaryClaimsSearch" populateMethod="' + this.listDietaryClaimsMethodName + '" bind="DataControl" renderingType="checkboxes" contextObject="' + this.listDietaryClaimsContextObject + '" anonymousBoundMethod="' + this.searchMethodName + '"></div>';
				return html
			},

			renderAdvancedSearchAllergensFilterComponent : function(el) {
				var html = "";
				html += '<div class="advancedSearchCategory">Allergens</div><div id="filterSearchCheckboxesDivAllergens"  templateName="filterSearchCheckboxesTemplate" name="AllergensSearchDP" fieldName="AllergensSearch"  populateMethod="' + this.listAllergensMethodName + '" bind="DataControl" renderingType="checkboxes" contextObject="' + this.listAllergensContextObject + '"  anonymousBoundMethod="' + this.searchMethodName + '"></div>';
				return html
			},

			renderAdvancedSearchCountryOfOriginFilterComponent : function(el) {
				var html = "";
				html += '<div bind="field" name="CountryOfOriginSearch"><div class="advancedSearchCategory">Country</div><input style="width:200px" id="cbCountry" bind="DataControl" emptyItemLabel="Select" renderingType="dropdownlist" populateMethod="' + this.listCountryOfOriginsMethodName + '" name="CountryOfOriginSearchDP" fieldName="CountryOfOriginSearch" attribute="value" class="k-textbox" contextObject="' + this.listCountryOfOriginsContextObject + '"  anonymousBoundMethod="' + this.searchMethodName + '"/></div>';
				return html
			},

			_executeAfterRenderAdvancedSearchCountryOfOriginFilterComponent : function(el) {
				renderKendoComponents($(el));
			},

			/**
			 * Method used in the list component to render the items on special button
			 */
			renderListOnSpecialItemsButtonComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'List Items On Special';
				html += window.expanz.html.renderMethod(this.listItemsOnSpecialMethodName, label, this.listItemsOnSpecialMethodContextObject);
				return html;
			},

			_executeAfterRenderListOnSpecialItemsButtonComponent : function(el) {
				var that = this;
				$("#" + this.listItemsOnSpecialMethodName + " button").click(function() {
					that.lastListAction = 'button';
				});
			},

			renderListPreviouslyOrderedButtonComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'List Previously Ordered Items';
				html += window.expanz.html.renderMethod(this.listPreviouslyOrderedMethodName, label, this.listPreviouslyOrderedContextObject);
				return html;
			},

			_executeAfterRenderListPreviouslyOrderedButtonComponent : function(el) {
				var that = this;
				$("#" + this.listPreviouslyOrderedMethodName + " button").click(function() {
					that.lastListAction = 'button';
				});
			},

			renderListItemsComponent : function(el) {
				var html = "";
				var itemsPerPage = (el !== undefined && el.attr('itemsPerPage') !== undefined) ? el.attr('itemsPerPage') : 9;
				var displayAsTable = boolValue(el.attr('displayAsTable'));
				var templateName = (el !== undefined && el.attr('templateName') !== undefined) ? el.attr('templateName') : 'productListItemTemplateGrid';
				var enableConfiguration = (el !== undefined && el.attr('enableConfiguration') !== undefined) ? el.attr('enableConfiguration') : 'false';
				if (displayAsTable) {
					html += this.renderDefaultListItemTemplate();
					html += this.renderDefaultListItemTemplateHeader();
				}
				else {
					html += this.renderDefaultListItemGridTemplate();
				}
				html += "<div id='searchResultTitle' class='searchResultTitle' style='display:none'>Showing Results for \"<span id='searchString'></span>\"</div>";
				html += '<div id="productListDiv" enableConfiguration="' + enableConfiguration + '" noItemText="No item matches your selection" isHTMLTable="' + displayAsTable + '" templateName="' + templateName + '"  itemsPerPage="' + itemsPerPage + '" name="' + this.productListName + '" bind="DataControl" renderingType="grid" populateMethod="' + this.productListPopMethod + '" autoPopulate="0" contextObject="' + this.productListContextObject + '"></div>';
				return html;
			},

			_executeAfterRenderListItemsComponent : function(el) {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($(el).find("#productListDiv"), 1);
				var that = this;
				$(el).find("#productListDiv").bind("table:rendered", function() {
					if (that.lastListAction == 'search') {
						$("#searchString").html($("#ItemSearch input").val());
						$("#searchResultTitle").show();
					}
					else {
						$("#searchResultTitle").hide();
						$("#ItemSearch input").val("");
					}

					if (that.lastListAction == 'specials') {
						$(el).find("#productListDiv").find("#noItemText").hide();
						$(el).find("#productListDiv").find("#noItemText").after("<div id='onSpecial' class='emptyListText'>No Specials at this time - Check back later</div>");
					}
					else {
						$(el).find("#productListDiv").find("#noItemText").show();
						$(el).find("#productListDiv").find("#onSpecial").remove();
					}
					
					$(el).find("[name=ItemsPerPage]").kendoDropDownList();
					
				});
			},

			renderListDisplayChoiceComponent : function(el) {
				var html = "<div class='listHeader'>";
				var labelList = (el !== undefined && el.attr('labelList') !== undefined) ? el.attr('labelList') : 'List display';
				var labelGrid = (el !== undefined && el.attr('labelGrid') !== undefined) ? el.attr('labelGrid') : 'Grid display';
				html += "<a id='displayAsList' href='#' class='itemsDisplay' >" + labelList + "</a><span class='itemsDisplaySeparator'> | </span>";
				html += "<a id='displayAsGrid' href='#' class='itemsDisplay'>" + labelGrid + "</a>";
				html += "</div>"
				return html;
			},

			_executeAfterRenderListDisplayChoiceComponent : function() {
				var userPref = window.expanz.Storage.getUserPreference("DefaultShoppingCartView");

				var productListAsTable = $("#productListDiv[isHTMLTable='true']");
				var productListAsGrid = $("#productListDiv[isHTMLTable='false']");

				if (userPref == 'displayAsList') {
					$("#displayAsList").addClass("selectedDisplay");
					productListAsTable.show();
					productListAsGrid.hide();
				}
				else {
					$("#displayAsGrid").addClass("selectedDisplay");
					productListAsGrid.show();
					productListAsTable.hide();
				}

				var that = this;
				$("#displayAsList").click(function() {
					$("#displayAsList").addClass("selectedDisplay");
					$("#displayAsGrid").removeClass("selectedDisplay");
					productListAsTable.show();
					productListAsGrid.hide();
					expanz.Net.GetSavePreferencesRequest(that.activity.collection, "DefaultShoppingCartView", 'displayAsList', true);
				});

				$("#displayAsGrid").click(function() {
					$("#displayAsList").removeClass("selectedDisplay");
					$("#displayAsGrid").addClass("selectedDisplay");
					productListAsTable.hide();
					productListAsGrid.show();
					expanz.Net.GetSavePreferencesRequest(that.activity.collection, "DefaultShoppingCartView", 'displayAsGrid', true);
				});

			},

			renderStandardOrdersListComponent : function(el) {
				var html = "";
				html += '<script type="text/template" id="listStandardOrdersItemTemplate">';
				html += '<div class="item"><div class="loadStandardOrderName"><a methodName="loadStandardOrderWithPrompt" href="javascript:void(0)"><%=data.Name%></a></div>';
				html += '<button methodName="deleteStandardOrderWithPrompt" class="deleteStandardOrder" href="javascript:void(0)"></button>';
				html += '<div class="clear"></div></div>';
				html += '</script>';
				html += '<script type="text/template" id="listStandardOrdersItemTemplateHeader">';
				html += '<div class="header">My standard orders';
				html += '</div>';
				html += '</script>';
				html += '<div id="listStandardOrders" class="standardOrders" itemsPerPage="10" name="listStandardOrders" bind="DataControl" renderingType="grid" populateMethod="' + this.myStandardOrdersPopMethod + '" contextObject="' + this.myStandardOrdersContextObject + '"></div>';
				return html;
			},

			/**
			 * Method used in the list component to render the template of an item in the grid
			 */
			renderDefaultListItemGridTemplate : function() {
				var html = '';
				html += '\
					<script type="text/template" id="productListItemTemplateGrid"> \
					<div class="productNDetail"> \
						<div class="product"> \
							<% if ( isImageValid(data.ThumbImage_FileContents) ){ %>  \
								<div class="productIcon left productThumbnail"> \
									<a title="<%= data.Name %>" href="' + window.config._URLblobs + '<%= data.Image_FileContents %>' + '" class="productImage"><img class="thumbnail" src="' + window.config._URLblobs + '<%= data.ThumbImage_FileContents %>' + '"/></a> \
								</div> \
							<% } %>  \
							<% if ( !isImageValid(data.ThumbImage_FileContents) ){ %>  \
								<div class="productIcon left productThumbnail noThumbnail"></div> \
							<% } %> \
							<div class="productTitle left"> \
								<p class="productTitleTxt"> \
								<% if ( data.ShortDescription ){ %> \
									<a href="javascript:void(0);" onclick="javascript:$(this).closest(\'.productNDetail\').children(\'.productdetails\').toggle()"><%= data.Name %></a> \
								<% } else { %>\
									<%= data.Name %> \
								<% } %> \
								</p> \
								<p class="productoffer"><%= window.expanz.html.getDisplayableDiscount(data.UdefString1,",&nbsp;") %></p> \
							</div> \
							<div class="productPrice left"> \
								<p class="productPriceText">$<%= data.DefaultSellPrice %></p>  \
								<p class="productCurrency">ea</p> \
							</div> \
							<% if ( !window.expanz.html.isEmpty(data.Available_From)) { %>  \
								<p class="availableFrom">Available from <%= data.Available_From %></p> \
							<% } else {%> \
							<% if ( data.SellRateCalcNotes == "No stock available" ) { %>  \
									<p class="noStock">No stock</p> \
							<% } else { %>\
								<div class="productCount left"> \
									<input class="gridUserInput" type="text" format="numeric"  id="userinput_quantity"></input>\
								</div> \
								<div class="left addProductMain"> \
									<a class="addProduct" methodName="saveItemFromCart"></a> \
								</div> \
							<% } }%> \
							<div class="clear"></div> \
							</div> \
						<div class="productdetails" style="display:none"><p><%= data.ShortDescription %></p></div> \
						</div> \
					</script>\
					';
				return html;
			},

			renderDefaultListItemTemplateHeader : function() {
				var html = ' \
					<script type="text/template" id="productListItemTemplateListHeader">\
					<thead><tr class="item listDisplay" style="height:25px;font-size:16px;text-align:center"> \
					<th class="cell" style="width:65px;">&nbsp;</th> \
					<th class="cell">Name</th> \
					<th class="cell" style="width:60px;">Price</th> \
					<th class="cell">Note</th> \
					<th class="cell" style="">Actions</th> \
					</tr></thead>\
					</script>';
				return html;
			},

			/**
			 * Method used in the list component to render the template of an item in the list
			 */
			renderDefaultListItemTemplate : function() {
				var html = ' \
					<script type="text/template" id="productListItemTemplateList"> \
					<tr class="item listDisplay"> \
					<td class="cell"> \
					<% if ( isImageValid(data.ThumbImage_FileContents) ){ %> \
					<img class="thumbnailList" src="<%= window.config._URLblobs  + data.ThumbImage_FileContents %>"/> \
					<% } %> \
					<% if ( !isImageValid(data.ThumbImage_FileContents) ){ %> \
						<img class="noThumbnailList" src="assets/images/no_image_available.png"/> \
					<% } %> \
					</td> \
					<td class="cell showDetail" ><label onclick="$(this).parent().parent().next().toggle()"><%= data.Name %></label></td> \
					<td class="cell"><label><b>$<%= data.DefaultSellPrice %></b></label></td> \
					<td class="cell">	\
					<label><%= window.expanz.html.getDisplayableDiscount(data.UdefString1) %></label> \
					<% if (data.AvailableQuantity <= 0 ) { %> \
						<% if (  data.SellRateCalcNotes == "No stock available" ) { %> \
							<i><%= $.i18n.prop(data.SellRateCalcNotes,data.Available_From)%></i> \
						<% } %> \
						<% if ( data.SellRateCalcNotes != "Not available before" ) { %> \
							<i><%= $.i18n.prop("message.itemForSale.noStock")%></i> \
						<% } %> \
					<% } %> \
					</td> \
					<td class="cell" style="text-align:center"> \
					<% if ( true ) { %> \
						<div> \
							<input class="gridUserInput" style="width:50px !important" type="text" format="numeric"  id="userinput_quantity"></input>\
							<button class="addToCartButton" methodName="saveItemFromCart">Add</button> \
						</div> \
					<% } %> \
					</td> \
				</tr> \
				<tr class="detail" style="display:none"> \
					<td colspan="100%"><%= data.ShortDescription || "No detail" %></td> \
				</tr> \
				</script> ';

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

				html += this.renderListItemsComponent();

				html += "</div>";
				return html;
			},

			_executeAfterRenderListComponent : function() {
				this._executeAfterRenderListItemsComponent();
				this._executeAfterRenderListDisplayChoiceComponent();
			},

			/**
			 * Renders the Categories as a tree component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:CategoriesTree&gt; or &lt;div class='shoppingCart-CategoriesTree'&gt;
			 * </pre>
			 * 
			 * Tag parameters:
			 * 
			 * @return html code
			 */
			renderCategoriesTreeComponent : function(treeEl) {
				return '<div id="categoriesTree" name="categoriesList" fieldName="' + this.categoryTreeName + '" selectionChangeAnonymousMethod="' + this.categoryTreeSelectionChangeAnonymousMethod + '"  selectionChangeAnonymousContextObject="' + this.categoryTreeSelectionChangeAnonymousContextObject + '" bind="DataControl" renderingType="tree" populateMethod="' + this.categoryTreePopMethod + '" type="recursiveList" contextObject="' + this.categoryTreeContextObject + '" class="tree"></div>';
			},

			_executeAfterRenderCategoriesTreeComponent : function() {
				var that = this;
				$("#categoriesTree").KendoTreeAdapter({
					labelAttribute : 'value',
					runAfterPublish : function() {
						$("#categoriesTree").data("kendoTreeView").bind("select", function(event) {
							that.lastListAction = 'tree';
						});
					}
				});

			},

			/**
			 * Renders the Categories as an accordion component
			 * 
			 * <pre>
			 * 	Used directly in html by either &lt;shoppingCart:CategoriesAccordion&gt; or &lt;div class='shoppingCart-CategoriesAccordion'&gt;
			 * </pre>
			 * 
			 * Tag parameters:
			 * 
			 * @return html code
			 */
			renderCategoriesAccordionComponent : function(treeEl) {
				return '<div><ul id="categoriesAccordion" name="' + this.categoryTreeName + '"  bind="DataControl" renderingType="accordion" populateMethod="' + this.categoryTreePopMethod + '" type="recursiveList" contextObject="' + this.categoryTreeContextObject + '" class="accordion"></ul></div>';
			},

			_executeAfterRenderCategoriesAccordionComponent : function() {
				var that = this;
				$("#categoriesAccordion").KendoPanelBarAdapter({
					labelAttribute : 'value',
					runAfterPublish : function() {
						$("#categoriesAccordion").data("kendoPanelBar").bind("select", function(event) {
							if ($(event.item).text() == 'Specials') {
								that.lastListAction = 'specials';
							}
							else {
								that.lastListAction = 'tree';
							}
						});
					},
					staticElements : [
						{
							label : 'Specials',
							method : this.listItemsOnSpecialMethodName,
							contextObject : this.listItemsOnSpecialMethodContextObject,
							position : 'end'
						}
					]
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
				html += window.expanz.html.renderGridTemplateField("UnitPrice", 50);
				html += '<div style="float:left"><input id="userinput_quantity" class="gridUserInput" style="width:48px !important" format="numeric" value="<%= data.PlanQuantity %>" autoUpdate="saveItemFromCart"/></div>';
				html += window.expanz.html.renderGridTemplateField("ValueIncTax", 65);
				html += '<button style="display:none" methodName="saveItemFromCart">Adjust</button>';
				html += '<button methodName="deleteItemFromCart">X</button>';
				html += window.expanz.html.endDiv();
				html += '</script>';
				html += "<div bind='DataControl' noItemText='Empty' renderingType='grid' id='lvMiniCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";
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

			renderMiniGoToCartBoxComponent : function(el) {
				var html = "";
				html += '<div><div id="miniCartBox" style="display:none" class="miniCartBox" onclick="if($(\'#nbItems\').text() != 0) window.location=\'' + this.shoppingCartCheckoutPage + '\'" >';
				html += '<span class="miniCartBoxImage">CART</span><span class="miniCartBoxTotal" bind="field" name="Total2"><span attribute="value">$0</span></span> <div bind="field" name="CartItemsCount" class="cartItemCount"><span  id="nbItems" attribute="value">0</span></div></div></div>';
				return html;
			},

			_executeAfterRenderMiniGoToCartBoxComponent : function() {
				var CartItemsCountField = this.activity.collection.get('CartItemsCount');
				if (CartItemsCountField) {
					CartItemsCountField.collection.bind('change:value', function(el) {
						if (el.get('value') == 0) {
							/* can hidden if wanted */
							$("#miniCartBox").show();
						}
						else {
							$("#miniCartBox").show();
						}
					});
				}

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
				var html = "";
				html += '<script type="text/template" id="lvMiniCartItemTemplate">';
				html += window.expanz.html.startDiv("item");
				html += window.expanz.html.renderGridTemplateField("ItemForSale_Name", 400);
				html += window.expanz.html.renderGridTemplateField("UnitPrice", 100);
				html += '<div style="width: 100px; float: left; margin-top:-3px"><input class="gridUserInput" style="width:50px !important" id="userinput_quantity" format="numeric" value="<%= data.PlanQuantity %>" autoUpdate="saveItemFromCart"/></div>';
				html += window.expanz.html.renderGridTemplateField("ValueIncTax", 120);
				html += '<button style="display:none" methodName="saveItemFromCart">Adjust</button>';
				html += '<div class="deleteButton"><button methodName="deleteItemFromCart">X</button></div>';
				html += window.expanz.html.endDiv();
				html += window.expanz.html.clearBoth();
				html += '</script>';

				html += '<script type="text/template" id="lvMiniCartItemTemplateHeader">';
				html += window.expanz.html.startDiv("header");
				html += window.expanz.html.renderHeaderGridField("Item", 400);
				html += window.expanz.html.renderHeaderGridField("Price", 100);
				html += window.expanz.html.renderHeaderGridField("Qty", 100);
				html += window.expanz.html.renderHeaderGridField("Total", 120);
				html += window.expanz.html.endDiv();
				html += window.expanz.html.clearBoth();
				html += '</script>';

				html += "<div class='checkoutList'>";
				html += "<div bind='DataControl' renderingType='grid' id='checkoutCart' name='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";

				html += "</div>";

				return html;

			},

			renderCheckoutDeliveryAddressComponent : function(checkoutEl) {
				var html = "";

				html += '\
				<div class="deliveryAddress"> \
					<div class="addressleft"> \
						<div bind="field" name="DeliveryAddressStreet" class=""> \
							<label attribute="label"></label> \
							<input type="text" attribute="value" class="k-textbox" /> \
						</div> \
						<div bind="field" name="DeliveryLocation.ExtendedName"> \
							<label>Suburb/State</label> \
							<span type="text" attribute="value" style="word-wrap:break-word" /> \
						</div> \
					</div> \
					<div class="addressRight"> \
						<div bind="field" name="DeliveryAddress2"> \
							<label>Address line 2</label> \
							<input type="text" attribute="value" class="k-textbox" /> \
						</div> \
						<div bind="field" name="DeliveryLocation.FindCode"> \
							<label class="changeSub">Change Suburb</label> \
							<input type="text" attribute="value" class="k-textbox" /> \
						</div> \
					</div> \
					<div class="clear"></div> \
				</div> \
				';
				return html;
			},

			renderCheckoutSubTotalComponent : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="Total" class="checkoutSubtotal"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutTotalTaxAmountComponent : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="TotalTaxAmount" class="checkoutSubtotalTaxAmount"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutFreightComponent : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="Freight" class="checkoutFreight"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutTotalComponent : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="Total2" class="checkoutTotal"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutPickupCheckboxComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Pick-up';
				html += '<div class="checkoutPickup" name="DeliveryMethod" bind="field"> ' + label + ' <input checkedValue="pickup" uncheckedValue="" attribute="value" type="checkbox"/></div>';
				return html;
			},

			renderCheckoutStandardOrderComponent : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Save as standard order';
				html += '<div class="checkoutStandardOrder" name="StandardName" bind="field"> ' + label + ' <input attribute="value" type="text" class="k-textbox"/>';
				html += '<span class="method" name="saveAsStandardOrder" id="saveAsStandardOrder" bind="method"><button attribute="submit" type="button" class="standardOrderSave">Save</button></span></div>'
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

			_executeAfterRenderCheckoutItemsListComponent : function() {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($("#checkoutCart"));
				var that = this;
				$("#checkoutCart").bind("table:rendered", function() {
					/* hiding the checkout part if no items and not order submitted message displayed */
					if ($("#checkoutCart > [nbItems]").attr("nbItems") === "0" && $('.k-window-title:contains("Order Submitted")').length == 0 ) {
						expanz.Views.redirect(that.shoppingCartPage);
					}
					else {
						$("#cartCheckout").show();
					}
				});
			},

			_executeAfterRenderSearchComponent : function(el) {
				var displayButton = el.attr('buttonVisible') !== undefined ? boolValue(el.attr('buttonVisible')) : true;
				var that = this;
				/* if button is not visible trigger change on value change after a delay of 100 to be sure the value is taken by the server */
				if (!displayButton) {
					$("#shoppingCartSearch #ItemSearch input").keypress(function(e) {
						if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
							$("#shoppingCartSearch #ItemSearch input").blur(); /* send the search value to the server */
						}
					});

					$("#shoppingCartSearch #ItemSearch input").change(function(e) {
						$("#shoppingCartSearch #ItemSearch input").blur();
						var timeoutID = window.setTimeout(function() {
							$('#shoppingCartSearch button').click();
						}, 100);

					});
				}
				/* else handle only the enter key click */
				else {
					$("#shoppingCartSearch #ItemSearch input").keypress(function(e) {
						if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
							$("#shoppingCartSearch #ItemSearch input").blur(); /* send the search value to the server */
							var timeoutID = window.setTimeout(function() {
								$('#shoppingCartSearch button').click();
							}, 100);
							return false;
						}
						else {
							return true;
						}
					});
				}

				$('#shoppingCartSearch button').click(function() {
					that.lastListAction = 'search';
				});

			},

			renderOrderHistoryComponent : function(el) {
				var html = "";
				var itemsPerPage = (el !== undefined && el.attr('itemsPerPage') !== undefined) ? el.attr('itemsPerPage') : 12;

				html += '<script type="text/template" id="orderHistoryItemTemplateHeader">';
				html += '<thead><tr class="item"><th sortField="SearchCode" style="width:100px">Search code</th><th style="width:200px" sortField="Name" >Name</th><th style="width:100px" sortField="Status" >Status</th><th  style="width:200px" sortField="CreationDate">Creation Date</th><th style="width:120px" sortField="Total">Amount</th><th>Actions</th></tr></thead>';
				html += '</script>';

				html += '<script type="text/template" id="orderHistoryItemTemplate">';
				html += '<tr class="item"><td><%=data.SearchCode%></td><td><%=data.Client_Name%></td><td><%=data.Status%></td><td><%=data.CreationDate%></td><td><%=data.Total%></td>';
				html += '<td><button methodName="showInvoice">Show Invoice</button></td></tr>';
				html += '</script>';

				html += '<div id="orderHistoryDivList" class="orderHistory" isHTMLTable="true" populateMethod="' + this.orderHistoryPopMethod + '" itemsPerPage="' + itemsPerPage + '" name="' + this.orderHistoryListName + '" bind="DataControl" renderingType="grid" contextObject="' + this.orderHistoryContextObject + '"></div>';
				return html;
			},

			isAnonymous : function() {
				if (this.activity == null)
					return null;
				return this.activity.collection.getAttr('allowAnonymous') === true && this.activity.collection.isAnonymous();
			}

		});

	/*
	 * static html rendering functions
	 */
	window.expanz.html = window.expanz.html || {};

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

	window.expanz.html.renderGridTemplateField = function(fieldName, width) {
		if (!width)
			width = 100;
		return '<div class="' + fieldName + '" style="width:' + width + 'px;float:left"><%= data.' + fieldName + ' %>&nbsp;</div>';
	};

	window.expanz.html.renderField = function(fieldName, showLabel, prompt, anonymousBoundMethod) {
		var field = '';
		field += '<div id="' + fieldName + '"  bind="field" name="' + fieldName + '" class="field ' + fieldName + '" anonymousBoundMethod=' + anonymousBoundMethod + '>';
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
		method += '<span bind="method" id="' + methodName + '" name="' + methodName + '" ' + ctx + visible + ' class="method" >';
		method += '<button type="button" attribute="submit" >' + buttonLabel + '</button>';
		method += '</span>';
		return method;
	};

	window.expanz.html.getDisplayableDiscount = function(discount, separator) {
		if (!discount)
			return "";
		if (separator === undefined)
			separator = "<br/>";
		discount = discount.replace(/;/g, separator);
		discount = discount.replace(/(\d*) @(\d*\.?\d*)/g, '<label class="discount">$1 items or more for &#36;$2 each</label>')
		return discount;
	};
	
	window.expanz.html.addNameToImageURL = function(currentUrl,name) {
		if (!currentUrl || !name)
			return "";
		var lastSlashPos = currentUrl.replace(/\\/g,"/").lastIndexOf("/");
		if (lastSlashPos >= 0 ){
			return currentUrl.splice(lastSlashPos + 1, 0 , escapeBadCharForURL(name) + "-");
		}
		return "";
	};	

	window.expanz.html.isEmpty = function(value) {
		if (value === undefined)
			return true;
		return value == "";
	};

	window.expanz.html.addDollar = function(price) {
		return "$ " + price;
	};

	window.expanz.html.submitLostPasswordForm = function(loginCode, EmailAdress) {
		var xml = '<Activity id="ERP.Person">';
		if (loginCode) {
			xml += '<Delta id="LoginCode" value="' + loginCode + '" />';
		}
		if (EmailAdress) {
			xml += '<Delta id="EmailAddress" value="' + EmailAdress + '" />';
		}
		xml += '<Method name="resetMyPasswordAnon">';
		xml += '</Method>';
		xml += '</Activity>';
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
			max = 99;
		$(hostEl).bind("table:rendered", function() {
			$(hostEl).find("[id*='_userinput_'][format='numeric']").each(function() {
				var kntb = null;

				/* look for current value of the input field */
				var inputVal = $(this).val();
				if (inputVal && inputVal > 0) {
					initValue = inputVal;
				}

				if (initValue === undefined) {
					kntb = $(this).kendoNumericTextBox({
						min : min,
						max : max,
						step : 1,
						format : "n0"
					});
				}
				else {
					kntb = $(this).kendoNumericTextBox({
						value : initValue,
						min : min,
						max : max,
						step : 1,
						format : "n0"
					});
				}

				kntb.data("kendoNumericTextBox").bind("spin", function(e) {
					// Call blur on the input field after 1 second of inactivity
					// (may trigger a delta change automatically)
					var that = this;
					if (that.timeOut)
						clearTimeout(that.timeOut);
					that.timeOut = setTimeout(function() {
						that._blur();
					}, 1000);
				});
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
