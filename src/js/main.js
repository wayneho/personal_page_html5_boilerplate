/**
 * Created by wayne on 11/17/2015.
 *
 * ISSUES:
 *      - carousel: changing slides too quickly (<img> element is not resolved properly because jqueryui adds a wrapper <div>)
 *      - canvas: doesn't load on sub pages when page is refreshed
 */

var canvas = {
    start: true,
    width: 0,
    height: 0
};

var loadVid = false;

var CarouselPrototype = {
    init: function(imageArray){
        this._imageArray = imageArray;
        this._current = 0;
        this._timer = "";
        this._index = "";
    },
    getImages: function(){
        return this._imageArray;
    },
    getCurrent: function(){
        return this._current;
    },
    incCurrent: function(){
        this._current = (this._current+1)%this._imageArray.length;
    },
    setCurrent: function(current){
        this._current = current;
    },
    setTimer: function(timer){
        this._timer = timer;
    },
    getTimer: function(){
        return this._timer;
    },
    setIndex: function(ind){
        this._index = ind;
    },
    getIndex: function(){
        return this._index;
    }
};


var proj1Images = ["img/tm1.jpg","img/tm2.jpg","img/tm3.jpg","img/tm4.jpg"];
var proj2Images = ["img/omdb1.jpg","img/omdb2.jpg","img/omdb3.jpg"];
var proj3Images = ["img/newsweek1.jpg","img/newsweek2.jpg","img/newsweek3.jpg"];

var project1 = Object.create(CarouselPrototype),
    project2 = Object.create(CarouselPrototype),
    project3 = Object.create(CarouselPrototype);
project1.init(proj1Images);
project2.init(proj2Images);
project3.init(proj3Images);

var projectArray = [project1, project2, project3];
projectArray.forEach(function(project, ind){
    project.setIndex(ind);
});


$(window).bind('load',function(){
    $('#background-wrapper').css('visibility','visible');
    $('.loader').hide();
    initCarousel(projectArray);
    initPage();

    //expand side bar
    $('.sidebar-button').click(function(){
        // show header and line divider
        $('.nav-header, .nav-divider').toggleClass('visible');
        $('.nav-link-title, .sidebar').toggleClass('expand-sidebar');
        $('.nav-links ul li a').toggleClass('restyle-list');
        $('.sidebar-button span').toggleClass('octicon-triangle-right octicon-triangle-left');
        $('.sidebar-main').toggleClass('add-padding-top');
        $('.main').toggleClass('push-main');

        // trigger resize event to resize the carousel + video wrapper
        $(window).trigger('resize');
    });

    // dynamically resize the carousel and video wrapper depending on screen size
    $(window).resize(function() {
        var wrapperHeight = $('.img-wrapper>img').height();
        $('.img-wrapper').css('height', wrapperHeight);
        $('iframe').css('height', wrapperHeight);
    });

    // submit form using formspree
    $('#contact-form').submit(function(event){
        event.preventDefault();
        sendEmail($(this));
    });

    // Clear alert message by clicking on element
    $('#alert').click(function(){
        $(this).html("");
    });

    // Display proper page on url hash change
    $(window).on('hashchange',function(){
        //console.log(window.location.hash);
        render(window.location.hash);
        resetCarousel(projectArray);
        window.scrollTo(0,0);
    });
});

// Initialize the first page to display
function initPage(){
    var hash = window.location.hash;
    render(hash);
}

// decides which page to show depending on current url hash value
function render(page){

    // // if loading sub-pages directly
    if(page !== ""){
        // show sidebar and main section
        $('.sidebar').show('slide',{direction: 'left'}, 500);
        $('.main').addClass('visible');
        // load videos if it hasn't been loaded yet
        if(!loadVid){
            $('#vid1').append('<iframe  src="https://www.youtube.com/embed/uw1ZF-nxOGY" frameborder="0" allowfullscreen></iframe>');
            $('#vid2').append('<iframe  src="https://www.youtube.com/embed/VMtSydjA_Ow" frameborder="0" allowfullscreen></iframe>');
            loadVid = true;
        }
    }

    // stop background animation in sub-pages
    canvas.start = false;
    $('#background-animation').hide();

    // hide current page
    $('.main>div').removeClass('visible');
    $('.nav-links li').removeClass('tab-active');
    $('.nav-links span').removeClass('text-white');
    $('.front-page').hide();



    // decide which page to show
    switch(page){
        case '#projects':
            $('.projects').addClass('visible');
            $('#project-tab').addClass('tab-active');
            $('#project-tab').find('span').addClass('text-white');
            break;
        case '#skills':
            $('.skills').addClass('visible');
            $('#skills-tab').addClass('tab-active');
            $('#skills-tab').find('span').addClass('text-white');
            break;
        case '#about':
            $('.about').addClass('visible');
            $('#about-tab').addClass('tab-active');
            $('#about-tab').find('span').addClass('text-white');
            break;
        case '#contact':
            $('.contact').addClass('visible');
            $('#contact-tab').addClass('tab-active');
            $('#contact-tab').find('span').addClass('text-white');
            break;
        default:
            // display index page hide sidebar and main section
            $('.front-page').fadeIn('slow');
            $('#background-animation').show();
            $('.sidebar').hide();
            canvas.start = true;
            $('.main').removeClass('visible');
    }
}

// append the images to the correct carousel
function initCarousel(projectArray){
    projectArray.forEach(function(project, ind){
        // get the carousel elements' index
        var imgWrapper = '.carousel>.img-wrapper:eq('+ind+')';
        var slideNav = '.carousel>.slide-nav>ul:eq('+ind+')';
        project.getImages().forEach(function(img){
            $(imgWrapper).append('<img src='+img+'>');
            $(slideNav).append('<li class="slide-nav-btn"></li>');
        });
    });
    // wait for images to load then start sliding timer
    $('.img-wrapper img').on('load',function(){
        startCarousel(projectArray);
    });

    // bind click events on carousel buttons
    selectSlide();
}


// Add height to the wrapper depending on img height start carousel timers
function startCarousel(projectArray){

    // set the image and video wrapper height
    var wrapperHeight = $('.img-wrapper img').height();
    $('.img-wrapper').css('height',wrapperHeight);
    $('iframe').css('height',wrapperHeight);

    // initiate the sliding timer for each carousel and store the id in the carousel's object
    projectArray.forEach(function(project){

        // clear any existing timer first
        var timer = project.getTimer();
        if(timer) clearInterval(timer);

        project.setTimer(createCarouselTimer(project));
    });

    // set first button to be active
    $('.slide-nav-btn:first-child').addClass('btn-active');
    // display the nav buttons
    $('.slide-nav>ul').css('display','initial');
}


// enable or disable carousel timer depending on url hash
// reset carousel and active button to first slide
function resetCarousel(projectArray){
    // check url hash for '#projects'
    if(window.location.hash === '#projects'){
        startCarousel(projectArray);
    }
    // when url hash does not equal #projects disable and reset carousel
    else{
        projectArray.forEach(function(project){
            // remove sliding timer
            clearInterval(project.getTimer());
            // set carousel to first image
            project.setCurrent(0);
            $('.img-wrapper img').css('display', 'none');
            $('.img-wrapper img:first-child').css('display', 'inline');
            // remove active button
            $('.slide-nav-btn').removeClass('btn-active');
        })
    }
}

// bind click events on the carousel buttons to display the proper slide
function selectSlide(){
    $('.slide-nav>ul').on('click','li', function(event){

        // get index of button clicked
        var slide = $(this).index();
        //console.log("button number: "+ $(this).index());

        // get the index of the corresponding carousel element
        var ind = $(event.target).closest('.carousel').index('.carousel');
        //console.log("carousel number: "+ind);
        var carousel = projectArray[ind];

        // determine direction to slide depending on position of the clicked button relative to the current slide
        var direction = slide > carousel.getCurrent() ? 'left':'right';

        // set and display the current slide, reset the sliding timer
        carousel.setCurrent(slide);
        clearInterval(carousel.getTimer());
        transitionSlide(carousel, direction, 400);
        carousel.setTimer(createCarouselTimer(carousel));
    });
}

// change slide image of the specified carousel
// the default direction is left
function transitionSlide(proj, direction,speed){
    // determine which carousel called this function
    var ind = proj.getIndex();
    var carousel = '.carousel:eq('+ind+')';

    // get correct slide direction (default is to the left)
    direction = typeof direction !== 'undefined' ? direction : 'left';
    speed = typeof speed !== 'undefined' ? speed : 500;

    // hide current image and remove active button style

    $(carousel+' .img-wrapper>img').hide('slide',{direction: direction},speed);
    $(carousel+' .slide-nav-btn').removeClass('btn-active').css('pointer-events', 'none');

    // get next image
    var next = proj.getCurrent() + 1;   // nth-child pseudo-selector is not 0 indexed so 1 is added to the value

    // display next image and add active button style
    $(carousel+' .img-wrapper>img:nth-child('+next+')').show('slide',{direction: direction==='left'?'right':'left'},speed);
    $(carousel+' .slide-nav-btn:nth-child('+next+')').addClass('btn-active');


    // prevent users from clicking nav buttons while slide is still moving
    setTimeout(function(){
        $(carousel+' .slide-nav-btn').not('.btn-active').css('pointer-events', 'auto');
    }, speed);
}

// transition to next slide every 5 secs
function createCarouselTimer(project){
    return setInterval(function(){
        project.incCurrent();
        transitionSlide(project);
    },5000);
}

function sendEmail(that){
    $.ajax({
        url: "//formspree.io/wayneho92@hotmail.com",
        method: "POST",
        data: that.serialize(),
        dataType: "json",
        beforeSend: function() {
            $('#alert').html('Sending message...').css('color','dodgerblue');
        },
        success: function(data) {
            $('#alert').html('Message sent').css('color','green');
            $('#contact-form')[0].reset();
        },
        error: function(err) {
            $('#alert').html('Ops, there was an error.').css('color','red');
        }
    });
}

/*
// Detect mobile browser and add height to background to fix disappearing url bar from creating white space
(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

if (jQuery.browser.mobile == true) {
    var newHeight = $(window).height() + 70;
    $("#background-image").css("height", newHeight);
    //console.log("mobile browser");
}
*/
