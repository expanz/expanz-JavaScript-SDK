﻿///#source 1 1 /source/js/components/shoppingCart.js
/* Author: kdamevin

 */
$(function() {

	window.expanz = window.expanz || {};

	window.expanz.ShoppingCart = window.expanz.Component
		.extend({

			componentName : 'shoppingCart',

			useHashInUrl : false,

			shopUrlRewritePattern : '/shop/',

			listItemsOnSpecialLabel : 'Specials',
			listItemsOnSpecialMethodName : "listItemsOnSpecial",
			listItemsOnSpecialMethodNameByPopMethod : "listItemsOnSpecialByPopMethod",
			listItemsOnSpecialMethodContextObject : "StockTranItem.ItemForSale",

			listItemsNewLabel : 'New Items',
			listItemsNewMethodName : "listItemsNew",
			listItemsNewMethodNameByPopMethod : "listItemsNewByPopMethod",
			listItemsNewMethodContextObject : "StockTranItem.ItemForSale",

			listItemsEndOfLineLabel : "End of line",
			listItemsEndOfLineMethodName : "listItemsEndOfLine",
			listItemsEndOfLineMethodContextObject : "StockTranItem.ItemForSale",

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

			listBrandsMethodName : "listBrands",
			listBrandsContextObject : "StockTranItem.ItemForSale",

			listCategoriesMethodName : "listCategories",
			listCategoriesContextObject : "StockTranItem.ItemForSale",

			shoppingCartPage : "shoppingCart",

			shoppingCartCheckoutPage : "shoppingCartCheckout",

			modules : window.expanz.Component.prototype.modules.concat([
				'Search',
				'AdvancedSearchAllergensFilter',
				'AdvancedSearchDietaryClaimsFilter',
				'AdvancedSearchCountryOfOriginFilter',
				'AdvancedSearchBrandsFilter',
				'AdvancedSearch',
				'Cart',
				'CategoriesTree',
				'CategoriesAccordion',
				'List',
				'ListOnSpecialItemsButton',
				'ListPreviouslyOrderedButton',
				'ListNewItemsButton',
				'ListItems',
				'StandardOrdersList',
				'ListDisplayChoice',
				'CartTitle',
				'CartItemsList',
				'CartTotals',
				'CartEmptyButton',
				'CartCheckoutButton',
				'MiniGoToCartBox',
				'CheckoutDeliveryAddress',
				'CheckoutDeliveryNotes',
				'CheckoutItemsList',
				'CheckoutEditCartButton',
				'CheckoutPayNowButton',
				'CheckoutPickupCheckbox',
				'CheckoutStandardOrder',
				'CheckoutSubTotal',
				'CheckoutTotalTaxAmount',
				'CheckoutFreight',
				'CheckoutTotal',
				'OrderHistory',
				'Breadcrumb',
				'Footer'
			]),

			initialize : function() {
				//window.expanz.Component.prototype.componentName = this.componentName;
				window.expanz.Component.prototype.initialize.call(this);
				var that = this;
				/* render component if present in the page */
				/*_.each(this.modules, function(module) {
					var moduleEl = window.expanz.html.findComponentModuleElement(that.componentName, module);
					if (moduleEl !== undefined) {
						moduleEl.each(function() {
							// if (moduleEl.attr('loaded') === undefined) {
							var moduleContent = that['render' + module + 'Module']($(this));
							$(this).append(moduleContent);
							moduleEl.attr('loaded', '1');
							// }
						});

					}
				});*/

				var activities = expanz.CreateActivity($('[bind=activity]'));
				if (activities !== undefined && activities.length > 0) {
					this.activity = activities[0];
					var initialCall = function() {
						var from = null;
						var catId = null;
						var catName = null;
						var catParentName = null;
						var search = null;
						/* using the hash */
						if (window.location.hash.length > 0) {
							from = getQueryHashParameterByName('from');
							catId = getQueryHashParameterByName('catId');
							catName = escapeHTML(getQueryHashParameterByName('catName')).replace("%20", " ");
							catParentName = escapeHTML(getQueryHashParameterByName('catParentName')).replace("%20", " ");
							search = getQueryHashParameterByName('search');
						}
						/* using the url -> url rewrite -> category */
						else {
							if (document.URL.indexOf('/shop/') != -1) {

								var categoryURL = document.URL.substr(document.URL.indexOf(that.shopUrlRewritePattern) + 6);
								var categoryArray = categoryURL.split("/");
								/* no parent category */
								if (/l(\d*)/.test(categoryArray[1])) {
									from = "tree";
									catId = RegExp.$1;
									catName = escapeHTML(categoryArray[0]).replace(/-/g, " ");
									catName = catName.replace(/&amp;/g, "&");
								}
								else if (/l(\d*)/.test(categoryArray[2])) {
									from = "tree";
									catId = RegExp.$1;
									catName = escapeHTML(categoryArray[1]).replace(/-/g, " ");
									catName = catName.replace(/&amp;/g, "&");
									catParentName = escapeHTML(categoryArray[0]).replace(/-/g, " ");
									catParentName = catParentName.replace(/&amp;/g, "&");
								}

							}

						}

						that.lastListAction = from;
						if (that.isAnonymous()) {

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
								}, {
									name : that.listBrandsMethodName,
									contextObject : that.listBrandsContextObject
								}, {
									name : that.listItemsOnSpecialMethodNameByPopMethod,
									contextObject : that.listItemsOnSpecialMethodContextObject
								}, {
									name : that.listItemsNewMethodNameByPopMethod,
									contextObject : that.listItemsNewMethodContextObject
								}
							];

							/* initial load -> user has copied the url, reloaded the page or is coming from google */
							if (from == 'tree') {
								dataModelList.push({
									name : that.categoryTreeSelectionChangeAnonymousMethod,
									contextObject : that.categoryTreeSelectionChangeAnonymousContextObject,
									additionalElement : '<StockTranItem.ItemForSale.ItemCategory.PersistentId>' + catId + '</StockTranItem.ItemForSale.ItemCategory.PersistentId>'
								});
								that.lastCategory = catName;
								that.lastCategoryParent = catParentName;
							}
							else if (from == 'specials') {
								dataModelList.push({
									name : that.listItemsOnSpecialMethodName,
									contextObject : that.listItemsOnSpecialMethodContextObject
								});
							}
							else if (from == 'newItems') {
								dataModelList.push({
									name : that.listItemsNewMethodName,
									contextObject : that.listItemsNewMethodContextObject
								});
							}
							else if (from == 'endOfLine') {
								dataModelList.push({
									name : that.listItemsEndOfLineMethodName,
									contextObject : that.listItemsEndOfLineMethodContextObject
								});
							}
							else if (from == 'previously') {
								dataModelList.push({
									name : that.listPreviouslyOrderedMethodName,
									contextObject : that.listPreviouslyOrderedContextObject
								});
							}
							else if (from == 'search') {
								/* doesnt support advanced search at the moment */
								dataModelList.push({
									name : that.searchMethodName,
									contextObject : that.searchMethodContextObject,
									additionalElement : '<ItemSearch>' + getQueryHashParameterByName('search') + '</ItemSearch>'
								});
								$("#ItemSearch input").val(search);
							}

							expanz.net.AnonymousMethodsRequest(dataModelList, that.activity.model);

							/* hide unwanted stuff when anonymous */
							$("[loginNeeded='true']").hide();
							// $("#rightPart").hide();
							$("#logout a").hide();
							$("#logout").unbind("click");
							$("#logout").click(function() {
								expanz.views.requestLogin();
							});

							$("#logout").append('<a class="login menuTitle">Login</a>');

						}
						else {
							/* initial load as a logged in user -> user has copied the url, reloaded the page */
							var methodAttributes = [];
							if (from == 'tree') {
							    expanz.net.DeltaRequest(that.categoryTreeName, catId, that.activity.model);
								that.lastCategory = catName;
								that.lastCategoryParent = catParentName;
							}
							else if (from == 'specials') {
								methodAttributes = [
									{
										name : "contextObject",
										value : that.listItemsOnSpecialMethodContextObject
									}
								];
								expanz.net.MethodRequest(that.listItemsOnSpecialMethodName, methodAttributes, null, that.activity.model);
							}
							else if (from == 'newItems') {
								methodAttributes = [
									{
										name : "contextObject",
										value : that.listItemsNewMethodContextObject
									}
								];
								expanz.net.MethodRequest(that.listItemsNewMethodName, methodAttributes, null, that.activity.model);
							}
							else if (from == 'endOfLine') {
								methodAttributes = [
									{
										name : "contextObject",
										value : that.listItemsEndOfLineMethodContextObject
									}
								];
								expanz.net.MethodRequest(that.listItemsEndOfLineMethodName, methodAttributes, null, that.activity.model);
							}
							else if (from == 'previously') {
								methodAttributes = [
									{
										name : "contextObject",
										value : that.listPreviouslyOrderedContextObject
									}
								];
								expanz.net.MethodRequest(that.listPreviouslyOrderedMethodName, methodAttributes, null, that.activity.model);
							}
							else if (from == 'search') {
								// TODO support search initial load for logged in user
							}
						}
					};
					if (this.activity.model.get('loading') === false) {
						initialCall();
					}
					else {
					    this.activity.model.bind("change:loading", function () {
							initialCall();
						});
					}
				}

				this._executeAfterInitalize(that);

				addPlaceHolderCapabilities();
			},

			/*_executeAfterInitalize : function(that) {
				_.each(this.modules, function(module) {
					var componentEl = window.expanz.html.findComponentModuleElement(this.componentName, module);
					if (componentEl !== undefined) {
						componentEl.each(function() {*/
							/* execute script after adding to content to the dom */
							/*if (that['_executeAfterRender' + module + 'Module']) {
								that['_executeAfterRender' + module + 'Module']($(this));
							}
						});

					}
				});
			},*/
			
			/**
			* Renders the Search component
			* 
			* <pre>
			* Used directly in html by either &lt;shoppingCart:search&gt; or &lt;div class='shoppingCart-Search'&gt;
			* </pre>
			* 
			* Tag parameters:
			* 
			* @param buttonVisible
			*           boolean, display or not the search button (Default is true)
			* @param buttonLabel
			*           string, label of the search button (Default is Search)
			* @return html code
			*/
			renderSearchModule : function(searchEl) {
				var displayButton = searchEl.attr('buttonVisible') !== undefined ? boolValue(searchEl.attr('buttonVisible')) : true;
				var inputPrompt = searchEl.attr('inputPrompt') !== undefined ? searchEl.attr('inputPrompt') : 'Search';
				var buttonLabel = searchEl.attr('buttonLabel') !== undefined ? searchEl.attr('buttonLabel') : 'Search';
				if (buttonLabel.length === 0)
					buttonLabel = '&nbsp;';
				var methodName = searchEl.attr('methodName') !== undefined ? searchEl.attr('methodName') : this.searchMethodName;
				var cssClass = (searchEl !== undefined && searchEl.attr('cssClass') !== undefined) ? searchEl.attr('cssClass') : 'button';
				var html = '';
				html += '<div id="shoppingCartSearch" class="search">';
				html += window.expanz.html.renderField('ItemSearch', '', inputPrompt, this.searchMethodName, "false");
				html += window.expanz.html.renderMethod(methodName, buttonLabel, cssClass, this.searchMethodContextObject, !displayButton);
				html += "</div>";
				return html;
			},

			/**
			* Renders the Advanced Search component
			* 
			* <pre>
			* Used directly in html by either &lt;shoppingCart:AdvancedSearch&gt; or &lt;div class='shoppingCart-AdvancedSearch'&gt;
			* </pre>
			* 
			* @return html code
			*/
			renderAdvancedSearchModule : function(searchEl) {
				var html = '';
				html += '<div id="shoppingCartAdvancedSearch" class="advancedSearch">';
				html += this.renderAdvancedSearchDietaryClaimsFilterComponent();
				html += this.renderAdvancedSearchAllergensFilterComponent();
				html += this.renderAdvancedSearchCountryOfOriginFilterComponent();
				html += "</div>";
				return html;
			},

			renderAdvancedSearchDietaryClaimsFilterModule : function(el) {
				var html = "";
				html += '<div class="advancedSearchCategory">Dietary Claims</div><div id="filterSearchCheckboxesDivDietaryClaims"  templateName="filterSearchCheckboxesTemplate" dataId="DietaryClaimsSearchDP" fieldName="DietaryClaimsSearch" populateMethod="' + this.listDietaryClaimsMethodName + '" bind="DataControl" renderingType="checkboxes" contextObject="' + this.listDietaryClaimsContextObject + '" anonymousBoundMethod="' + this.searchMethodName + '"></div>';
				return html;
			},

			renderAdvancedSearchAllergensFilterModule : function(el) {
				var html = "";
				html += '<div class="advancedSearchCategory">Allergens</div><div id="filterSearchCheckboxesDivAllergens"  templateName="filterSearchCheckboxesTemplate" dataId="AllergensSearchDP" fieldName="AllergensSearch"  populateMethod="' + this.listAllergensMethodName + '" bind="DataControl" renderingType="checkboxes" contextObject="' + this.listAllergensContextObject + '"  anonymousBoundMethod="' + this.searchMethodName + '"></div>';
				return html;
			},

			renderAdvancedSearchCountryOfOriginFilterModule : function(el) {
				var html = "";
				html += '<div bind="field" name="CountryOfOriginSearch" anonymousBoundMethod="' + this.searchMethodName + '"><div class="advancedSearchCategory">Country</div><input style="width:200px" id="cbCountry" bind="DataControl" emptyItemLabel="Select" renderingType="dropdownlist" populateMethod="' + this.listCountryOfOriginsMethodName + '" dataId="CountryOfOriginSearchDP" attribute="value" class="k-textbox" contextObject="' + this.listCountryOfOriginsContextObject + '"/></div>';
				return html;
			},

			_executeAfterRenderAdvancedSearchCountryOfOriginFilterModule : function(el) {
				renderKendoComponents($(el));
			},

			renderAdvancedSearchBrandsFilterModule : function(el) {
				var html = "";
				html += '<div bind="field" name="BrandsSearch" anonymousBoundMethod="' + this.searchMethodName + '"><div class="advancedSearchCategory">Brand</div><input style="width:200px" id="cbBrand" bind="DataControl" emptyItemLabel="Select" renderingType="dropdownlist" populateMethod="' + this.listBrandsMethodName + '" dataId="BrandSearchDP" attribute="value" class="k-textbox" contextObject="' + this.listBrandsContextObject + '"  /></div>';
				return html;
			},

			_executeAfterRenderAdvancedSearchBrandsFilterModule : function(el) {
				renderKendoComponents($(el));
			},

			/**
			* Method used in the list component to render the items on special button
			*/
			renderListOnSpecialItemsButtonModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'List ' + this.listItemsOnSpecialLabel;
				var methodName = (el !== undefined && el.attr('methodName') !== undefined) ? el.attr('methodName') : this.listItemsOnSpecialMethodName;
				var cssClass = (el !== undefined && el.attr('cssClass') !== undefined) ? el.attr('cssClass') : 'button';
				html += window.expanz.html.renderMethod(methodName, label, cssClass, this.listItemsOnSpecialMethodContextObject, false);
				return html;
			},

			_executeAfterRenderListOnSpecialItemsButtonModule : function(el) {
				var that = this;
				$("#" + this.listItemsOnSpecialMethodName + " button").click(function() {
					that.lastListAction = 'specials';
					that._updateURLHash();
				});
			},

			renderListNewItemsButtonModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'List ' + this.listItemsNewLabel;
				var methodName = (el !== undefined && el.attr('methodName') !== undefined) ? el.attr('methodName') : this.listItemsNewMethodName;
				var cssClass = (el !== undefined && el.attr('cssClass') !== undefined) ? el.attr('cssClass') : 'button';
				html += window.expanz.html.renderMethod(methodName, label, cssClass, this.listItemsNewMethodContextObject, false);
				return html;
			},

			_executeAfterRenderListNewItemsButtonModule : function(el) {
				var that = this;
				$("#" + this.listItemsNewMethodName + " button").click(function() {
					that.lastListAction = 'newItems';
					that._updateURLHash();
				});
			},

			renderListPreviouslyOrderedButtonModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'List Previously Ordered Items';
				var methodName = (el !== undefined && el.attr('methodName') !== undefined) ? el.attr('methodName') : this.listPreviouslyOrderedMethodName;
				var cssClass = (el !== undefined && el.attr('cssClass') !== undefined) ? el.attr('cssClass') : 'button';
				html += window.expanz.html.renderMethod(methodName, label, cssClass, this.listPreviouslyOrderedContextObject);
				return html;
			},

			_executeAfterRenderListPreviouslyOrderedButtonModule : function(el) {
				var that = this;
				$("#" + this.listPreviouslyOrderedMethodName + " button").click(function() {
					that.lastListAction = 'previouslyOrdered';
					that._updateURLHash();
				});
			},

			renderListItemsModule : function(el) {
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
				html += '<div id="' + this.productListName + '" enableConfiguration="' + enableConfiguration + '" noItemsText="No item matches your selection" templateName="' + templateName + '"  itemsPerPage="' + itemsPerPage + '" dataId="' + this.productListName + '" bind="DataControl" populateMethod="' + this.productListPopMethod + '" autoPopulate="0" contextObject="' + this.productListContextObject + '"></div>';
				return html;
			},

			_executeAfterRenderListItemsModule : function(el) {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($(el).find("#"+this.productListName), 1);
				var that = this;
				$(el).find("#"+this.productListName).bind("datapublication:rendered", function() {
					if (that.lastListAction == 'search') {
						$("#searchString").html($("#ItemSearch input").val());
						$("#searchResultTitle").show();
					}
					else {
						$("#searchResultTitle").hide();
						$("#ItemSearch input").val("");
					}

					if (that.lastListAction == 'specials') {
						$(el).find("#"+this.productListName).find("#noItemsText").hide();
						$(el).find("#"+this.productListName).find("#noItemsText").after("<div id='onSpecial' class='emptyListText'>No Specials at this time - Check back later</div>");
					}
					else if (that.lastListAction == 'newItems') {
						$(el).find("#"+this.productListName).find("#noItemsText").hide();
						$(el).find("#"+this.productListName).find("#noItemsText").after("<div id='newItems' class='emptyListText'>No new items at this time - Check back later</div>");
					}
					else if (that.lastListAction == 'endOfLine') {
						$(el).find("#"+this.productListName).find("#noItemsText").hide();
						$(el).find("#"+this.productListName).find("#noItemsText").after("<div id='endOfLine' class='emptyListText'>No end of line items at this time - Check back later</div>");
					}
					else {
						$(el).find("#"+this.productListName).find("#noItemsText").show();
						$(el).find("#"+this.productListName).find("#onSpecial").remove();
					}

					$(el).find("[name=ItemsPerPage]").kendoDropDownList();

					that._updateBreadCrumb();
				});
			},

			_updateURLHash : function() {
				if (this.updateUrlOrHash === true) {
					var addParamHash = '';
					/* always use hash for search */
					if (this.lastListAction == 'search') {
						addParamHash = ';search=' + $("#ItemSearch input").val();
						window.location.hash = "from=" + this.lastListAction + addParamHash;
					}
					else if (this.lastListAction == 'tree') {
						/* check if browser support HTML5 pushstate, if not use hash instead */
						if (supports_history_api()) {
							var newUrl = config.urlAbsoluteSiteName + this.shopUrlRewritePattern;
							if (this.lastCategoryParent !== undefined && this.lastCategoryParent !== '') {
								newUrl += escapeBadCharForURL(this.lastCategoryParent) + "/";
							}
							newUrl += escapeBadCharForURL(this.lastCategory) + "/l" + this.lastCategoryId + "/";
							window.history.pushState({
								cat : this.lastCategoryId
							}, this.lastCategory, newUrl);
						}
						else {
							addParamHash = ";catId=" + this.lastCategoryId + ";catName=" + this.lastCategory;
							if (this.lastCategoryParent !== undefined && this.lastCategoryParent !== '') {
								addParamHash += ';catParentName=' + this.lastCategoryParent;
							}
							window.location.hash = "from=" + this.lastListAction + addParamHash;
						}

					}
					else {
						window.location.hash = "from=" + this.lastListAction;
					}
				}
			},

			_updateBreadCrumb : function() {
				if ($("#breadcrumb").length > 0) {
					var homeLink = '<a href="' + getPageUrl(this.shoppingCartPage) + '">Shop home</a>';
					var sep = " &gt; ";
					if (this.lastListAction == 'search') {
						$("#breadcrumb").html(homeLink + sep + "Search");
					}
					else if (this.lastListAction == 'specials') {
						$("#breadcrumb").html(homeLink + sep + this.listItemsOnSpecialLabel);
					}
					else if (this.lastListAction == 'newItems') {
						$("#breadcrumb").html(homeLink + sep + this.listItemsNewLabel);
					}
					else if (this.lastListAction == 'endOfLine') {
						$("#breadcrumb").html(homeLink + sep + this.listItemsEndOfLineLabel);
					}
					else if (this.lastListAction == 'previouslyOrdered') {
						$("#breadcrumb").html(homeLink + sep + "Previously Ordered");
					}
					else if (this.lastListAction == 'tree') {
						var that = this;
						if ($("#categoriesTree").data('kendoTreeView') !== undefined) {
							$("#breadcrumb").html(homeLink + sep);
							if (this.lastCategoryParent !== undefined && this.lastCategoryParent !== '') {
								$("#breadcrumb").append("<a id='breadcrumbParentCategory' href='#' onclick='javascript:void(0)'>" + this.lastCategoryParent + "</a>" + sep);

								$("#breadcrumbParentCategory").click(function() {
									/* find the category in the tree a emulate a click */
									var parentCat = $("#categoriesTree").find('span').filter(function() {
										return $(this).text() === that.lastCategoryParent;
									});
									if (parentCat && parentCat.length > 0)
										parentCat.click();
								});
							}

							var currentCatFound = $("#categoriesTree").find('span').filter(function() {
								return $(this).text() === that.lastCategory;
							});
							// TODO Imrprove and retrieve it from the id somehow
							if (currentCatFound && currentCatFound.length > 0) {
								$("#breadcrumb").append(this.lastCategory);
							}
							else {
								$("#breadcrumb").append('Current category');
							}

						}
					}
					else {
						$("#breadcrumb").html("Shop home");
					}
				}

			},

			renderListDisplayChoiceModule : function(el) {
				var html = "<div class='listHeader'>";
				var labelList = (el !== undefined && el.attr('labelList') !== undefined) ? el.attr('labelList') : 'List display';
				var labelGrid = (el !== undefined && el.attr('labelGrid') !== undefined) ? el.attr('labelGrid') : 'Grid display';
				html += "<a id='displayAsList' href='#' class='itemsDisplay' >" + labelList + "</a><span class='itemsDisplaySeparator'> | </span>";
				html += "<a id='displayAsGrid' href='#' class='itemsDisplay'>" + labelGrid + "</a>";
				html += "</div>";
				return html;
			},

			_executeAfterRenderListDisplayChoiceModule : function() {
				var userPref = window.expanz.Storage.getUserPreference("DefaultShoppingCartView");

				var productListAsTable = $("#"+this.productListName+"[isHTMLTable='true']");
				var productListAsGrid = $("#"+this.productListName+"[isHTMLTable='false']");

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
					expanz.net.GetSavePreferencesRequest(that.activity.model, "DefaultShoppingCartView", 'displayAsList', true);
				});

				$("#displayAsGrid").click(function() {
					$("#displayAsList").removeClass("selectedDisplay");
					$("#displayAsGrid").addClass("selectedDisplay");
					productListAsTable.hide();
					productListAsGrid.show();
					expanz.net.GetSavePreferencesRequest(that.activity.model, "DefaultShoppingCartView", 'displayAsGrid', true);
				});

			},

			renderStandardOrdersListModule : function(el) {
				var html = "";
				html += '<script type="text/template" id="listStandardOrdersItemTemplate">';
				html += '<div class="item <%= ((rowIndex % 2 == 1) ? "gridRowAlternate" : "gridRow") + (rowModel.get("displayStyle") ? " grid-" + rowModel.get("displayStyle") : "") %>"><div class="loadStandardOrderName"><a methodName="loadStandardOrderWithPrompt" href="javascript:void(0)"><%=data.Name%></a></div>';
				html += '<button methodName="deleteStandardOrderWithPrompt" class="deleteStandardOrder" href="javascript:void(0)"></button>';
				html += '<div class="clear"></div></div>';
				html += '</script>';
				html += '<script type="text/template" id="listStandardOrdersItemTemplateHeader">';
				html += '<div class="header">My standard orders';
				html += '</div>';
				html += '</script>';
				html += '<div id="listStandardOrders" class="standardOrders" itemsPerPage="10" dataId="listStandardOrders" bind="DataControl" populateMethod="' + this.myStandardOrdersPopMethod + '" contextObject="' + this.myStandardOrdersContextObject + '"></div>';
				return html;
			},

			/**
			* Method used in the list component to render the template of an item in the grid
              NOTE: Button click event handlers are added by expanz.factory.js, according to 
              data obtained from the formmapping.xml file.
			*/
			renderDefaultListItemGridTemplate : function() {
				var html = '';
				html += '\
					<script type="text/template" id="productListItemTemplateGridHeader"> \
					</script>\
					\
				    <script type="text/template" id="productListItemTemplateGrid"> \
					<div class="productNDetail <%= ((rowIndex % 2 == 1) ? "gridRowAlternate" : "gridRow") + (rowModel.get("displayStyle") ? " grid-" + rowModel.get("displayStyle") : "") %>"> \
						<div class="product"> \
							<% if ( isImageValid(data.ThumbImage_FileContents) ){ %>  \
								<div class="productIcon left productThumbnail"> \
									<a title="<%= data.Name %>" href="' + window.config.urlBlobs + '<%= data.Image_FileContents %>' + '" class="productImage"><img class="thumbnail" src="' + window.config.urlBlobs + '<%= data.ThumbImage_FileContents %>' + '"/></a> \
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
									<input class="gridUserInput" type="text" format="numeric"  id="<%= rowModel.id %>_userinput_quantity"></input>\
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
					<thead>\
			        <tr class="item listDisplay" style="height:25px;font-size:16px;text-align:center"> \
					<th class="cell" style="width:65px;">&nbsp;</th> \
					<th class="cell">Name</th> \
					<th class="cell" style="width:60px;">Price</th> \
					<th class="cell">Note</th> \
					<th class="cell" style="">Actions</th> \
					</tr>\
			        <thead>\
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
					<img class="thumbnailList" src="<%= window.config.urlBlobs  + data.ThumbImage_FileContents %>"/> \
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
							<input class="gridUserInput" style="width:50px !important" type="text" format="numeric"  id="<%= rowModel.id %>_userinput_quantity"></input>\
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
			renderListModule : function(listEl) {

				var html = '';
				html += '<div id="shoppingCartList" class="list">';

				html += this.renderListOnSpecialItemsButtonComponent();

				html += this.renderListItemsComponent();

				html += "</div>";
				return html;
			},

			_executeAfterRenderListModule : function() {
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
			renderCategoriesTreeModule : function(treeEl) {
				return '<div id="categoriesTree" dataId="categoriesList" fieldName="' + this.categoryTreeName + '" selectionChangeAnonymousMethod="' + this.categoryTreeSelectionChangeAnonymousMethod + '"  selectionChangeAnonymousContextObject="' + this.categoryTreeSelectionChangeAnonymousContextObject + '" bind="DataControl" renderingType="tree" populateMethod="' + this.categoryTreePopMethod + '" type="recursiveList" contextObject="' + this.categoryTreeContextObject + '" class="tree"></div>';
			},

			_executeAfterRenderCategoriesTreeModule : function() {
				var that = this;
				$("#categoriesTree").KendoTreeAdapter({
					labelAttribute : 'value',
					expandedOnLoad : false,
					runAfterPublish : function() {
						$("#categoriesTree").bind("TreeSelectionChanged", function(event, options) {
							if (options['text'] == that.listItemsOnSpecialLabel) {
								that.lastListAction = 'specials';
							}
							else if (options['text'] == that.listItemsNewLabel) {
								that.lastListAction = 'newItems';
							}
							else if (options['text'] == that.listItemsEndOfLineLabel) {
								that.lastListAction = 'endOfLine';
							}
							else {
								that.lastListAction = 'tree';
								that.lastCategory = options['text'];
								that.lastCategoryParent = options['parentText'];
								that.lastCategoryId = options['id'];
							}
							that._updateURLHash();
						});
					},
					staticElements : [
						{
							label : this.listItemsOnSpecialLabel,
							method : this.listItemsOnSpecialMethodName,
							contextObject : this.listItemsOnSpecialMethodContextObject,
							position : 'beginning'
						}, {
							label : this.listItemsNewLabel,
							method : this.listItemsNewMethodName,
							contextObject : this.listItemsNewMethodContextObject,
							position : 'beginning'
						}, {
							label : this.listItemsEndOfLineLabel,
							method : this.listItemsEndOfLineMethodName,
							contextObject : this.listItemsEndOfLineMethodContextObject,
							position : 'beginning'
						}
					]
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
			renderCategoriesAccordionModule : function(treeEl) {
				return '<div><ul id="categoriesAccordion" fieldName="' + this.categoryTreeName + '" bind="DataControl" renderingType="accordion" populateMethod="' + this.categoryTreePopMethod + '" type="recursiveList" contextObject="' + this.categoryTreeContextObject + '" class="accordion"></ul></div>';
			},

			_executeAfterRenderCategoriesAccordionModule : function() {
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
							that._updateURLHash();
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

			renderCartTitleModule : function(el) {
				var html = "";
				html += "<div class='title'>Shopping cart</div>";
				return html
			},

			renderCartItemsListModule : function(el) {
				var html = "";
				html += '<script type="text/template" id="lvMiniCartItemTemplate">';
				html += window.expanz.html.startDiv("item");
				html += window.expanz.html.renderGridTemplateField("ItemForSale_Name", 200);
				html += window.expanz.html.renderGridTemplateField("UnitPrice", 50);
				html += '<div style="float:left"><input id="<%= rowModel.id %>_userinput_quantity" class="gridUserInput" style="width:48px !important" format="numeric" value="<%= data.PlanQuantity %>" autoUpdate="saveItemFromCart"/></div>';
				html += window.expanz.html.renderGridTemplateField("ValueIncTax", 65);
				html += '<button style="display:none" methodName="saveItemFromCart">Adjust</button>';
				html += '<button methodName="deleteItemFromCart">X</button>';
				html += window.expanz.html.endDiv();
				html += '</script>';
				html += "<div bind='DataControl' noItemsText='Empty' renderingType='grid' id='lvMiniCart' dataId='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";
				return html
			},

			_executeAfterRenderCartItemsListModule : function() {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($("#lvMiniCart"));
			},

			renderCartTotalsModule : function(el) {
				var html = "";
				html += "<div style='display:none' id='cartTotals' class='cartTotals'>";
				html += window.expanz.html.renderReadOnlyField("Total", true);
				// html += window.expanz.html.renderReadOnlyField("Freight", true);
				// html += window.expanz.html.renderReadOnlyField("Total2", true);
				html += "</div>";
				return html
			},

			renderCartEmptyButtonModule : function(el) {
				var html = "";
				html += "<div  id='cartEmptyButton' class='emptyCart' bind='method' name='emptyCart'>";
				html += "<button attribute='submit'>Empty cart</button>";
				html += "</div>";
				return html
			},

			renderCartCheckoutButtonModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Go to Checkout';
				html += '<button id="cartCheckout" onclick="window.location=\'' + getPageUrl(this.shoppingCartCheckoutPage) + '\'">' + label + '</button>';
				return html
			},

			_executeAfterRenderCartCheckoutButtonModule : function() {
			    $("#lvMiniCart").bind("datapublication:rendered", function () {

					/* hiding the checkout part if no items */
			        if ($("#lvMiniCart > [data-itemcount]").attr("data-itemcount") === "0") {
						$("#cartCheckout").hide();
						$("#cartTotals").hide();
						$("#cartEmptyButton").hide();
					}
					else {
						$("#cartCheckout").show();
						$("#cartTotals").show();
						$("#cartEmptyButton").show();
					}
				});
			},

			renderMiniGoToCartBoxModule : function(el) {
				var html = "";
				html += '<div><div id="miniCartBox" style="display:none" class="miniCartBox" onclick="if($(\'#nbItems\').text() != 0) window.location=\'' + getPageUrl(this.shoppingCartCheckoutPage) + '\'" >';
				html += '<span class="miniCartBoxImage">CART</span><span class="miniCartBoxTotal" bind="field" name="Total2"><span attribute="value">$0</span></span> <div bind="field" name="CartItemsCount" class="cartItemCount"><span id="nbItems" attribute="value">0</span></div></div></div>';
				return html;
			},

			_executeAfterRenderMiniGoToCartBoxModule : function() {
			    var CartItemsCountField = this.activity.model.fields.getFirstChildByAttribute('fieldId', 'CartItemsCount');
				if (CartItemsCountField) {
					CartItemsCountField.collection.bind('change:value', function(el) {
						if (el.get('value') === 0) {
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
			renderCartModule : function(cartEl) {
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

			_executeAfterRenderCartModule : function() {
				this._executeAfterRenderCartCheckoutButtonComponent();
				this._executeAfterRenderCartItemsListComponent();
			},

			renderCheckoutItemsListModule : function(checkoutEl) {
				var html = "";
				html += '<script type="text/template" id="lvMiniCartItemTemplate">';
				html += window.expanz.html.startDiv("item");
				html += window.expanz.html.renderGridTemplateField("ItemForSale_Name", 400);
				html += window.expanz.html.renderGridTemplateField("UnitPrice", 100);
				html += '<div style="width: 100px; float: left; margin-top:-3px"><input class="gridUserInput" style="width:50px !important" id="<%= rowModel.id %>_userinput_quantity" format="numeric" value="<%= data.PlanQuantity %>" autoUpdate="saveItemFromCart"/></div>';
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
				html += "<div bind='DataControl' renderingType='grid' id='lvMiniCart' dataId='" + this.miniCartName + "' contextObject='" + this.miniCartContextObject + "'></div>";

				html += "</div>";

				return html;

			},

			renderCheckoutDeliveryAddressModule : function(checkoutEl) {
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

			renderCheckoutDeliveryNotesModule : function(checkoutEl) {
				var html = "";

				html += '\
				<div class="deliveryNotes"> \
						<div bind="field" name="DeliveryNotes" class=""> \
							<label attribute="label"></label> \
							<textarea attribute="value" class="k-textbox" /> \
						</div> \
					<div class="clear"></div> \
				</div> \
				';
				return html;
			},

			renderCheckoutSubTotalModule : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="Total" class="checkoutSubtotal"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutTotalTaxAmountModule : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="TotalTaxAmount" class="checkoutSubtotalTaxAmount"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutFreightModule : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="Freight" class="checkoutFreight"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutTotalModule : function(checkoutEl) {
				var html = "";
				html += '<div bind="field" name="Total2" class="checkoutTotal"><span attribute="value"></span></div>';
				return html;
			},

			renderCheckoutPickupCheckboxModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Pick-up';
				html += '<div class="checkoutPickup" name="DeliveryMethod" bind="field"> ' + label + ' <input checkedValue="pickup" uncheckedValue="" attribute="value" type="checkbox"/></div>';
				return html;
			},

			renderCheckoutStandardOrderModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Save as standard order';
				html += '<div class="checkoutStandardOrder" name="StandardName" bind="field"> ' + label + ' <input attribute="value" type="text" class="k-textbox"/>';
				html += '<span class="method" name="saveAsStandardOrder" id="saveAsStandardOrder" bind="method"><button attribute="submit" type="button" class="standardOrderSave">Save</button></span></div>'
				return html;
			},

			renderCheckoutEditCartButtonModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Edit cart';
				html += '<span><button id="gotoCart" type="button" onclick="window.location=\'' + getPageUrl(this.shoppingCartPage) + '\'">' + label + '</button></span>';
				return html;
			},

			renderCheckoutPayNowButtonModule : function(el) {
				var html = "";
				var label = (el !== undefined && el.attr('label') !== undefined) ? el.attr('label') : 'Pay now';
				var methodName = (el !== undefined && el.attr('methodName') !== undefined) ? el.attr('methodName') : 'Checkout';
				var cssClass = (el !== undefined && el.attr('cssClass') !== undefined) ? el.attr('cssClass') : 'button';
				html += window.expanz.html.renderMethod(methodName, label, cssClass);
				return html;
			},

			// renderCheckoutListItemsComponent : function(checkoutEl) {
			// var html = "";
			//
			// return html;
			// },

			_executeAfterRenderCheckoutItemsListModule : function() {
				window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent($("#lvMiniCart"));
				var that = this;
				$("#lvMiniCart").bind("datapublication:rendered", function () {
					/* hiding the checkout part if no items and not order submitted message displayed */
				    if ($("#lvMiniCart > [data-itemcount]").attr("data-itemcount") === "0" && ($('.k-window-title:contains("Order Submitted")').length === 0) && $('.k-window-title:contains("Order Saved")').length === 0) {
						expanz.views.redirect(that.shoppingCartPage);
					}
					else {
						$("#cartCheckout").show();
					}
				});
			},

			_executeAfterRenderSearchModule : function(el) {
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
					that._updateURLHash();
				});

			},

			renderOrderHistoryModule : function(el) {
				var html = "";
				var itemsPerPage = (el !== undefined && el.attr('itemsPerPage') !== undefined) ? el.attr('itemsPerPage') : 12;

				html += '<script type="text/template" id="orderHistoryItemTemplateHeader">';
				html += '<thead><tr class="item"><th sortField="SearchCode" style="width:100px">Search code</th><th style="width:200px" sortField="Name" >Name</th><th style="width:100px" sortField="Status" >Status</th><th  style="width:200px" sortField="CreationDate" defaultSortDirection="desc">Creation Date</th><th style="width:120px" sortField="Total">Amount</th><th>Actions</th></tr></thead>';
				html += '</script>';

				html += '<script type="text/template" id="orderHistoryItemTemplate">';
				html += '<tr class="item"><td><%=data.SearchCode%></td><td><%=data.Client_Name%></td><td><%=data.Status%></td><td><%=data.CreationDate%></td><td><%=data.Total%></td>';
				html += '<td class="actions"><% if(sortValues.Status >= 20){ %><button methodName="showInvoice">Show Invoice</button><% } %></td></tr>';
				html += '</script>';

				html += '<table id="orderHistoryDivList" class="orderHistory" populateMethod="' + this.orderHistoryPopMethod + '" itemsPerPage="' + itemsPerPage + '" dataId="' + this.orderHistoryListName + '" bind="DataControl" contextObject="' + this.orderHistoryContextObject + '"></table>';
				return html;
			},

			renderBreadcrumbModule : function(el) {
				var html = "";

				html += '<div id="breadcrumb" class="breadcrumb" >';
				html += '</div>';
				return html;
			},

			_executeAfterRenderBreadcrumbModule : function(el) {
				this._updateBreadCrumb();
			},

			isAnonymous : function() {
				if (this.activity === null)
					return null;
				return this.activity.model.get('allowAnonymous') === true && this.activity.model.isAnonymous();
			}

		});

	/*
	* static html rendering functions
	*/
	window.expanz.html.getDisplayableDiscount = function(discount, separator) {
		if (!discount)
			return "";
		if (separator === undefined)
			separator = "<br/>";
		discount = discount.replace(/;/g, separator);
		discount = discount.replace(/(\d*) @(\d*\.?\d*)/g, '<label class="discount">$1 items or more for &#36;$2 each</label>')
		return discount;
	};

	window.expanz.html.anonymousPersonActivity = "ERP.Person";

	window.expanz.html.submitLostPasswordForm = function(loginCode, emailAddress, callbacks) {
	    var xml = '<Activity id="' + window.expanz.html.anonymousPersonActivity + '">';
	    
		if (loginCode) {
			xml += '<Delta id="LoginCode" value="' + loginCode + '" />';
		}
	    
		if (emailAddress) {
			xml += '<Delta id="EmailAddress" value="' + emailAddress + '" />';
		}
	    
		xml += '<Method name="resetMyPasswordAnon">';
		xml += '</Method>';
		xml += '</Activity>';
	    
		window.expanz.net.CreateAnonymousRequest(xml, callbacks);
	};

	window.expanz.html.renderNumericTextBoxesOnTableRenderedEvent = function(hostEl, initValue, min, max) {
		if (min === undefined)
			min = 1;
		if (max === undefined)
			max = 99;
		$(hostEl).bind("datapublication:rendered", function () {
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
	};

	window.expanz.html.showLostPasswordPopup = function() {
		var clientMessage = new expanz.models.ClientMessage({
			id : 'lostPasswordPopup',
			title : 'Lost password',
			url : 'lostPassword.html'
		});
		var lostPwdPopup = new window.expanz.views.UIMessage({
			id : clientMessage.id,
			model : clientMessage
		}, $('body'));
	};
	
});

