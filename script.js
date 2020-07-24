let scaylaDailyIndex = -1;
const UNASSIGNED = 'Unassigned';
const MINIMUM_VALID_TIME_SECONDS = 5;
let previousClick = +(new Date());
let nextInScaylaTimeout;
let laterInScaylaTimeout;
let next_1;
let next_2;
let currentPerson;

let nicoHolidays = {
    day: 180,
    text: ""
};

const andThenOptions = {
    yes: 'And then: ',
    no: 'Next: '
}

const scaylaDailyTimes = {};
const scaylaAfterDaily = {};

const checkbox = '<input type="checkbox" id="next_cb" value="1" checked style="opacity: 0.7"/>';


const dailyIndexes = [];

$(function() {
    $('body').addClass('daily-time').append(`
        <style>
          body.daily-time #ghx-column-header-group {
            /*top: -20px !important;*/
          }
          body.daily-time #ghx-column-header-group, body.daily-time #ghx-column-header-group .ghx-column {
            background: transparent !important;
            border-bottom: none !important;
          }
          body.daily-time #ghx-pool .ghx-swimlane:not(.ghx-closed) .ghx-swimlane-header {
            opacity: 0 !important;
          }
          .scayla-popup {
            position: fixed;
            min-width: 125px;
            background: white;
            z-index: 100;
            display: flex;
            padding: 10px 30px;
            box-shadow: 0 0 6px -1px #666;
            border-radius: 7px;
          }
          #next-in-scayla {
            right: 20px;
            top: calc(100% - 160px);
            /* min-height: 50px; */
            flex-direction: column;
            justify-content: space-between;
          }
          #next-in-scayla > span {
		    padding: 4px;
        position: relative;
		  }
          #next-in-scayla-box {
          	display: flex;
          	flex-direction: row;
          	align-items: center;
            justify-content: space-between;
          }
          #next-in-scayla-name {
            padding-right: 20px;
          }
          #next-in-scayla-and-then, #previous-in-scayla-box {
            opacity: 0.3;
          }
          #next-in-scayla-and-then.right-after {
            opacity: 1;
            font-weight: bold;
          }
          .danger {
          	color: #e74c3c;
          }
          .success {
          	color: #27ae60;
          }
          #scayla-notify-next {
		    left: 50%;
		    margin-left: -100px;
		    bottom: -100px;
		    height: 70px;
		    transition: all 0.4s ease-out;
		    align-items: center;
		    justify-content: center;
          }
          #scayla-notify-next.show {
          	bottom: 40px;
          }
          #scayla-notify-next-name > b {
          	font-size: 20px;
          }
          #scayla-notify-next-img {
          	border-radius: 100%;
		    margin-right: 20px;
		    height: 65px;
          }


        #next_cb:not(:checked) + #next_b {
          opacity: 0.2;
        }
        #next-later {
          cursor: pointer;
          margin-left: 30px;
        }
        #qc {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            flex-direction: column;;
            justify-content: center;
            opacity: 0;
            transition: all 3s ease-out;
            z-index: 99;
            background: rgba(200, 200, 200, 0.7);
        }
        #qc.show {
          opacity: 1
        }
        #qc > h1 {
          font-size: 100px;
        }
        #scayla-daily-times {
          position: fixed;
          right: 20px;
          top: 20px;
          opacity: 0.6;
          background: #eee;
          list-style-type: none;
          padding: 10px;
        }
        input#scayla-remember-input {
            padding: 4px;
            width: 210px;
        }
        #next-in-scayla-notes-box {
          height: 3px;
          opacity: 0;
          transition: all 0.2s ease-out;
        }
        #next-in-scayla-notes-box:hover {
          opacity: 0.3;
          height: 25px;
        }
        #scayla-after-daily-stays {
            margin-top: 40px;
            background: #eee;
            padding: 10px;
            border-radius: 10px;
            border: 1px solid #777;
        }
        label[for="show-ranking"] {
            position: fixed;
            top: 0px;
            right: 89px;
            padding: 10px;
            cursor: ns-resize;
        }
        </style>
        <label for="show-ranking">
          <input type="checkbox" id="show-ranking" checked value="1"></input>
        </label>
        <div id="qc" style="display: none"><h1>Questions? Comments?</h1>
          <ul id="scayla-daily-times"></ul>
          <div id="scayla-after-daily-stays" style="display: none">
            <h3><span id="scayla-after-daily-stays-title"></span> please stay. You mentioned:</h3>
          </div>
        </div>
        <div id="next-in-scayla" class="scayla-popup">
            <span id="previous-in-scayla-box" style="display: none">
              Before: <span id="previous-in-scayla-name"></span> <b id="previous-in-scayla-time"></b>
            </span>
            <span id="next-in-scayla-box">
	            <label id="next-in-scayla-name" for="next_cb"></label>
	            <button
	              id="next-in-scayla-button"
	              class="aui-button aui-button-primary aui-style"
	              >Next</button>
	        </span>
            <span id="next-in-scayla-and-then">
               <span id="next-and-then"></span>
               <span id="next-in-scayla-and-then-name"></span>
            </span>
            <span id="next-in-scayla-notes-box">
                <span id="scayla-remember-name" style="display: none"></span>
                <input type="text" id="scayla-remember-input">
            </span>
        </div>
        <div id="scayla-notify-next" class="scayla-popup">
          <img id="scayla-notify-next-img"/>
          <span id="scayla-notify-next-name"></span>
          <button id="next-later" style="display: block;" class="aui-button aui-button-primary aui-style">Later...</button>
        </div>
        `);

    $("#ghx-operations").hide();

    const teamLength = $("#ghx-pool .ghx-swimlane").length - 1; // because of "Unassigned"
    for (let i = 0; i < teamLength; ++i) {
        dailyIndexes.push(i);
    }
    // shuffle(dailyIndexes);

    $("#next-in-scayla-button").click(function() {
        closeAll();
        setTimeout(() => {
            if (scaylaDailyIndex >= 0) {
                currentTime($("#ghx-pool .ghx-swimlane:eq(" + dailyIndexes[scaylaDailyIndex] + ")"));
            }
            scaylaDailyIndex = nextIndex(scaylaDailyIndex);

            currentPerson = $("#ghx-pool .ghx-swimlane:eq(" + dailyIndexes[scaylaDailyIndex] + ")")
            next_1 = $("#ghx-pool .ghx-swimlane:eq(" + dailyIndexes[scaylaDailyIndex + 1] + ")")
            next_2 = $("#ghx-pool .ghx-swimlane:eq(" + dailyIndexes[scaylaDailyIndex + 2] + ")")

            if (currentPerson.length) {
                expandItem(currentPerson)
                nextInScayla(next_1, next_2);
            } else {
                console.log('Reached the end of Daily');
                $("#scayla-notify-next").removeClass('show');
                $("#next-in-scayla-name").html('Finished.');
                $("#next-in-scayla-button").attr('disabled', true);
                $("body").removeClass('daily-time');
                $("#qc").show().addClass('show');

                showTimes();
                scaylaAfterDailyStays();

                $("#next-in-scayla").fadeOut(8000, () => {

                });
            }
        }, 100);
    }).trigger('click');

    $('#next-and-then').html(andThenOptions.yes);
});

function currentTime(item_1) {
    const name = getFunnyName(item_1.find('.ghx-heading span[role="button"]').html());
    const time = Math.floor((+(new Date()) - previousClick) / 1000);
    if (time > MINIMUM_VALID_TIME_SECONDS) {
      scaylaDailyTimes[name] = {name: name, time: time};
    }
    previousClick = +(new Date());
    $("#previous-in-scayla-name").html(name).parent().show();
    $("#previous-in-scayla-time")
        .html(' (' + time + 's)').toggleClass('danger', time >= 60).toggleClass('success', time <= 20);

}

function expandItem(item_1) {

    const name = item_1.find('.ghx-heading span[role="button"]').html();

    item_1.find('.js-expander').click();
    $("#subnav-title").html(getFunnyName(name));
    $("#ghx-board-name").html('Now speaking:');
    setTimeout(() => item_1[0].scrollIntoView(), 50);
    notifyCurrent(item_1);

}

function nextInScayla(item_1, item_2) {

    const name = getFunnyName(item_1.find('.ghx-heading span[role="button"]').html());
    const andThenName = getFunnyName(item_2.find('.ghx-heading span[role="button"]').html());

    $('#next-in-scayla-and-then').removeClass('right-after');

    $("#next-in-scayla-name").html(checkbox + '<b id="next_b">' + name + '</b>');
    if (!item_1.length) {
      $("#next-in-scayla-name").html('');
      $("#next-in-scayla-button").html('Finish Daily');
        $("#next-in-scayla-and-then").html('&nbsp;');
    } else {
      if (!item_2.length) {
        $("#next-in-scayla-and-then").html('... and done');
      } else {
        $("#next-in-scayla-and-then-name").html(andThenName);
      }
    }

}

function closeAll() {
    $("#ghx-pool .ghx-swimlane:not(.ghx-closed) .js-expander").click();
}

function notifyCurrent(item_1) {
    const name = getFunnyName(item_1.find('.ghx-heading span[role="button"]').html());
    const src = item_1.find('.ghx-avatar > img').attr('src');

    clearTimeout(nextInScaylaTimeout);
    clearTimeout(laterInScaylaTimeout);

    $("#scayla-notify-next-name").html('Now: <b>' + name + '</b>');
    $("#scayla-remember-name").html(name);
    $("#scayla-remember-input").attr('placeholder', 'Note for ' + name);
    $("#scayla-notify-next").addClass('show');
    $("#scayla-notify-next-img").attr('src', src);
    nextInScaylaTimeout = setTimeout(function() {
        $("#scayla-notify-next").removeClass('show');
    }, 12000);


    // hide the button and show it later...
    $("#next-later").hide();
    laterInScaylaTimeout = setTimeout(function() {
      $("#next-later").show();
    }, 3000);

    if (name.match(/upfer/) && (new Date()).getDayOfYear() === nicoHolidays.day) {
        setTimeout(function() {

            alert(nicoHolidays.text)
        }, 100);
    }
}







/// HELPERS

function getFunnyName(name) {
    if (!name) {
        return '';
    }
    if (name.match(/ommeli/)) {
        return 'El Bommeli';
    }
    return name;
}

function nextIndex(index) {
    if (isNext()) {
        return index + 1;
    } else {
        return index + 2;
    }
}

function showTimes() {
    if ($("#show-ranking:checked").length === 0) {
        return;
    }
    const sortedTimes = Object.values(scaylaDailyTimes).sort((a, b) => b.time - a.time);
    const sortedTimesHTML = [];
    for (let i = 0; i < sortedTimes.length; ++i) {
        sortedTimesHTML.push('<li>' + sortedTimes[i].name + ': <b>' + sortedTimes[i].time + 's</b></li>');
    }
    $("#scayla-daily-times").html(sortedTimesHTML.join(''));
}

function scaylaAfterDailyStays() {
    if (!Object.keys(scaylaAfterDaily).length) {
        return;
    }

    const results = [];

    // scaylaAfterDaily
    for (const name in scaylaAfterDaily) {
        console.log(name, scaylaAfterDaily[name]);
        scaylaAfterDaily[name] = scaylaAfterDaily[name].map((n) => `<b class="after-daily-topic">${n}</b>`);
        // console.log(scaylaAfterDaily[name]);
        let last = null;
        if (scaylaAfterDaily[name].length > 1) {
            last = scaylaAfterDaily[name].pop();
        }
        const things = scaylaAfterDaily[name].join(', ') + (last ? ` and ${last}` : '');

        results.push(`<li>${name}: ${things}</li>`);
    }

    $("#scayla-after-daily-stays").show();

    $("#scayla-after-daily-stays-title").html(Object.keys(scaylaAfterDaily).map((n) => `<b class="after-daily-topic-title">${n}</b>`).join(', '));
    $("#scayla-after-daily-stays").append('<ul>' + results.join('') + '</ul>');
}

function isNext() {
    return (!$("#next_cb").length || $("#next_cb:checked").length === 1);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
















$(document).on('click', '#next_cb', function(event) {
    if (!isNext()) {
        $('#next-and-then').html(andThenOptions.no);
        $('#next-in-scayla-and-then').addClass('right-after');
    } else {
        $('#next-and-then').html(andThenOptions.yes);
        $('#next-in-scayla-and-then').removeClass('right-after');
    }
})

$(document).on('click', '#next-later', function(event) {
    // add current index to the list, for later...
    dailyIndexes.push(dailyIndexes[scaylaDailyIndex]);
    console.log(scaylaDailyIndex, dailyIndexes[scaylaDailyIndex], dailyIndexes);
    $("#next-in-scayla-button").trigger('click');
})

$(document).on('blur keypress', '#scayla-remember-input', function(event) {
    if (
      event.target.value &&
      event.type === 'focusout' ||
      (event.type === 'keypress' && event.keyCode === 13)
    ) {
        // Save person for `after-daily`
        const name = $("#scayla-remember-name").html();
        const note = event.target.value;
        scaylaAfterDaily[name] = scaylaAfterDaily[name] || [];
        scaylaAfterDaily[name].push(note);
        console.log('After Daily Notes:', scaylaAfterDaily);

        event.target.value = '';
    }
})
$(document).on('mouseenter', '#scayla-remember-input', function(event) {
    $('#scayla-remember-input').focus();
})
