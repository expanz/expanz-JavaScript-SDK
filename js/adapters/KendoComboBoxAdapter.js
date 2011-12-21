$.fn.KendoComboBoxAdapter = function() { 
    
	/* instantiate Kendo Control */
   var cb = $(this).kendoComboBox();
   var list = cb.data("kendoComboBox");
   
   /**
    *  define publishData which is called when list of data is ready
    *  
    */
   var publishData = function (event,data){
   	  /* transform xml data to json data and refresh the combobox element*/
   	  var localData= [];

   	  _.each($(data).find('Row'), function (row) {
   		  var rowId = $(row).attr('id');
             _.each($(row).find('Cell'), function (cell) {
           	  localData.push({text: $(cell).html(),value: rowId});
             });
          });
   			  
   	  
   	  var ds = new kendo.data.DataSource({
   	      data : localData
   	  });

   	  list.dataSource = ds;
   	  ds.read();
   	  list.refresh();
   	  /* set initial value if existing */
   	  if(cb.val() != undefined){
   		  list.value(cb.val());
   	  }
   	  

   };
   
   /* when the field gets a new value from the server, update the combobox element */
   var onValueUpdated = function (event,newValue){
	   list.value(newValue);
   };
   
    
   /* bind listenners */
   cb.bind("publishData", publishData);
   cb.bind("valueUpdated", onValueUpdated);

}

