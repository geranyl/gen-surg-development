(function(window, document, $, undefined){

var slideout = new Slideout({
  'panel': document.getElementById('main'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70,
  'touch': false
});



$(document).ready(function(){
  $('nav').css('opacity','1');
 });





/**setup sliding menu**/

document.querySelector('.js-slideout-toggle').addEventListener('click', function() {
  slideout.toggle();
});


var fixed = document.querySelector('.fixed-header');
var button = document.querySelector('.js-slideout-toggle');

slideout.on('translate', function(translated) {
  fixed.style.transform = 'translateX(' + translated + 'px)';
});

slideout.on('beforeopen', function () {
  fixed.style.transition = 'transform 300ms ease';
  fixed.style.transform = 'translateX(256px)';
});

slideout.on('beforeclose', function () {
  fixed.style.transition = 'transform 300ms ease';
  fixed.style.transform = 'translateX(0px)';
  
});

slideout.on('open', function () {
  fixed.style.transition = '';
  button.classList.add('is-active');
  button.classList.add('opaque');
});

slideout.on('close', function () {
  fixed.style.transition = '';
  button.classList.remove('is-active');
  button.classList.remove('opaque');
  $searchInput.val('');
  clearSearchMatches();
});


/**slide menu**/
document.getElementById("menu").addEventListener("click", function(e){
	if(e.target.nodeName == 'A' && screen.width<=768){
		slideout.close();
	}
}, true);
  

/**restructure tables for mobile**/  
$('table').stacktable();

/**decor**/
var menuColors = ['#ffbb00', '#da4ff0', '#ff880d', '#d1ff2c', '#ff562c', '#f0ee78', '#ff88ff', '#63ffff', '#a565ff'];

var borderObject = {"border-color": "#ffbb00", 
             "border-left-width":"8px", 
             "border-left-style":"solid"}
var startColorIndex = 0;             
$('.TOC > ul > li > a').each(function(index, element){
	borderObject['border-color'] = menuColors[startColorIndex];
	startColorIndex = (startColorIndex+1) % menuColors.length;
	$(this).css(borderObject);
});


function clearSearchMatches(){
  $allListElements.show();
  $allMatches=[];
}

/**lunr search**/

var idx;
var $searchInput = $('input.search'),
  $allListElements = $('#menu ul > li'),
  $allMatches=[];

function trySearch(){
    var searchInput = $searchInput[0].value;
    if(searchInput.length > 2){
      var response = idx.search(searchInput);
      if(response.length){
        var i=0;
        $allMatches=[];
        for(i=0; i<response.length; i++){
          var resp = response[i].ref;
           $allMatches.push(filterMenu(resp));
        }
        $allListElements.hide();
        for (i=0; i<$allMatches.length; i++){
          $allMatches[i].show();
        }
      }
    }else{
      clearSearchMatches();
    }  
} 

function filterMenu(ref){
  console.log('ref',ref)
    var $matchingListElements = $allListElements.filter(function(i, li){
        var listItemText = $(li).text().toUpperCase(), 
            searchText = ref.toUpperCase();
        return ~listItemText.indexOf(searchText);
    });

    return($matchingListElements)
  }


function enableSearch(){
  $('input.search').on('search keyup', trySearch);
}

$.getJSON( "index.json", function( data ) {
  idx = lunr.Index.load(data)
  enableSearch();
});




})(window, document, jQuery);