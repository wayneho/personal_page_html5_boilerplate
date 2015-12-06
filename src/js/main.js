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
        console.log(window.location.hash);
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
    // if loading sub-pages directly show sidebar and content
    if(page !== ""){
        // show sidebar and main section
        $('.sidebar').show('slide',{direction: 'left'}, 500);
        $('.main').addClass('visible');
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
        console.log("button number: "+ $(this).index());

        // get the index of the corresponding carousel element
        var ind = $(event.target).closest('.carousel').index('.carousel');
        console.log("carousel number: "+ind);
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
    $(carousel+' .slide-nav-btn').removeClass('btn-active');

    // get next image
    var next = proj.getCurrent() + 1;   // nth-child pseudo-selector is not 0 indexed so 1 is added to the value

    // display next image and add active button style
    $(carousel+' .img-wrapper>img:nth-child('+next+')').show('slide',{direction: direction==='left'?'right':'left'},speed);
    $(carousel+' .slide-nav-btn:nth-child('+next+')').addClass('btn-active');

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

