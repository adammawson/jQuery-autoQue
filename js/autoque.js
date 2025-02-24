// big bugs:  
// We can only operate on the "auto ID" at the moment
// passing JSON to the autoque controls CSS seems to be broken :\
// if you pause and restart its really slow because it thinks it has ages to animate

(function( $ ){

  var debug = true;
  function errlog(error){
    if (console){
      if(debug == true){
        console.log(error);
      }
    }
  }

  $.fn.autoque = function( options ) {
    var settings = {
      'hoverRequired'     : 'false', // Is a hover required to see the controls?
      'fontSize'        : '36px', // The font size used
      'fontColor'	: '#fff', // The color of the font
      'controlSize'     : '', // size of the controls - will auto resize
      'controlRadius'   : '20px', // the radius of the corners on the controls
      'controlOpacity'  : '.9', // the opacity of the controls
      'controlBGColor'  : 'lightgrey',
      'controlLocation' : '"right","10px"' // The location of the controls
    };

    // Put the options together
    if ( options )
    {
      $.extend( settings, options );
    }

    // Measure the height and width of the container div
    var height = this.height();
    errlog("height of div is "+height);
    var width = this.width();
    errlog("width of div is "+height);

    // Set a blank timePlayed and false playing value
    var timePlayed = 0;
    var playing = false; // We need this value to see if we are currently playing or not
    var interval = false;
    var speed = 0;

    // Get current content and a word count
    var original = this.html();
    var wordCount = original.split(' ').length;
    if (wordCount < 30){
      original = "Your word count is less than 30 so we have replaced the text with some longer contents..  Here it is!  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
      wordCount = original.split(' ').length;
    }
 
    // how long would this wordcount take?
    var timeToTalk = (wordCount / .75) * 100; // in seconds

    // Define the controls and write them to the UI
    var controls = "<div class='aQbutton' id='cRewind' title='Rewind'>&#9668;&#9668;</div> <div class='aQbutton' id='cUnplay' title='Play backwards'>&#9668;</div> <div class='aQbutton' id='cPause' title='Pause'>=</div><div class='aQbutton' id='cPlay' title='Play'>&#9658;</div><div class='aQbutton' id='cFastForward' title='Fast Forward'>&#9658;&#9658;</div><div id='speed'></div>";
    $(this).html("<div id='auto'>" + original +"</div>");
    $(this).append("<div id='autoqueControls'><div id='fastslow'><div id='slower' title='slower'>-</div><div id='faster' title='Faster'>+</div></div>"+controls+"</div>");
    $("#auto").css({'color':settings.fontColor});
    $("#autoqueControls").css({'width':settings.controlSize}); 
    $("#autoqueControls").css({'opacity':settings.controlOpacity});
    $("#autoqueControls").css('borderRadius',settings.controlRadius);
    $("#fastslow").css('borderRadius',settings.controlRadius);
/*    $("#slower").css('borderRadius',settings.controlRadius);
    $("#faster").css('borderRadius',settings.controlRadius);*/
    $("#autoqueControls").css({"right":"10px","bottom":"5px"}); // This needs fixing cake
    $("#autoqueControls").css({'backgroundColor':settings.controlBGColor});

    $(this).css({'font-size':settings.fontSize});

    // Add some event listeners onto the buttons
    $('#cRewind').click(function(){rewind();});
    $('#cUnplay').click(function(){unplay();});
    $('#cPause').click(function(){pause();});
    $('#cPlay').click(function(){play();});
    $('#cFastForward').click(function(){fastForward();});
    $('#faster').click(function(){faster();});
    $('#slower').click(function(){slower();});


    // Some functions to control the playback
    function rewind(){ // A rewind function
      playing = false;
      clearInterval(interval);
      errlog("Performing a rewind");
      $('#auto').stop();
      $('#auto').animate({'top':'0px'}, 'fast');
    }

    function unplay(){ // An unplay function
      $('#auto').stop();
      $('#auto').animate({'top':'+'+height+'px'}, timeToTalk, 'linear', function(){resetTimePlayed();});
    }

    function pause(){ // A pause function
      $('#auto').stop();
      playing = false;
      clearInterval(interval);
    }

    function play(){ // A play function
      playing = true;
      interval = setInterval(increaseTimePlayed,100);
      // First things first, put the top of the div at the bottom
      $('#auto').height(height+'px');
      $('#example').css('overflow','hidden');
      currentPosition = $('#auto').css('top');
      errlog(currentPosition);
      errlog(height);
      if (currentPosition == "-"+height+"px"){
        errlog("Restarting play as it appears to have finished");
        $('#auto').animate({'top':height+'px'}, 'linear');
      }

      if (currentPosition == '0px'){ // This if statement stops the pause button from re-starting the whole process after being unpaused
        $('#auto').css({'top':height+'px'});
        errlog("Animating the top of the document to be off the page");
      }
      else{
        errlog(timePlayed*100);
        timeToTalk = timeToTalk -(timePlayed*100); // Reculculate the time left to play
        errlog ("newly culclated time to talk is "+timeToTalk);
        timePlayed = 0;
      }
      $('#auto').stop();
      $('#auto').animate({'top':'-'+height+'px'}, timeToTalk, 'linear', function(){resetTimePlayed();}); 
    }

    function fastForward(){
      playing = false;
      clearInterval(interval);
      errlog("Fast forwarding this doc");
      currentPosition = $('#auto').css('top');
      errlog(currentPosition);
      forwardedPosition = currentPosition.replace("px","") - 100;
      errlog("Sending top of contents to "+forwardedPosition+"px");
      $('#auto').stop();
      $('#auto').animate({'top':forwardedPosition+'px'}, 100, 'linear');
      // it should keep playing here
    }

    function faster(){
      playing = false;
      clearInterval(interval);
      speed++;
      timeToTalk = timeToTalk*.8;
      timePlayed = 0;
      $('#auto').stop();
      $('#auto').animate({'top':'-'+height+'px'}, timeToTalk, 'linear');
      showspeed(speed);
    }

    function slower(){
      playing = false;
      clearInterval(interval);
      speed--; 
      timeToTalk = timeToTalk*1.2;
      timePlayed = 0;
      $('#auto').stop();
      $('#auto').animate({'top':'-'+height+'px'}, timeToTalk, 'linear');
      showspeed(speed);
    }

    function increaseTimePlayed(){
      if (playing == true){
        timePlayed++;
        errlog(timePlayed/10); // This outputs the number of seconds we have played for
      }
    }

    function resetTimePlayed(){
      playing = false;
      timePlayed = timePlayed/10;
      errlog("Time played through till completion was: "+ timePlayed +" seconds");
      timePlayed = 0;
    }

    function showspeed(speed){
      $('#speed').html(speed);
      $('#speed').fadeIn();
      setTimeout("$('#speed').fadeOut();",2000);
    }

  };
})( jQuery );


