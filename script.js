let scaylaDailyIndex = -1;
const UNASSIGNED = 'Unassigned';
let previousClick = +(new Date());
let nextInScaylaTimeout;
let laterInScaylaTimeout;

let nicoHolidays = {
    day: 180,
    text: ""
};

const andThenOptions = {
    yes: 'And then: ',
    no: 'Next: '
}

const times = {};

const checkbox = '<input type="checkbox" id="next_cb" value="1" checked/>';


const laterIds = [];

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
            bottom: 50px;
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
        #times {
          position: fixed;
          right: 20px;
          top: 20px;
          opacity: 0.6;
          background: #eee;
          list-style-type: none;
          padding: 10px;
        }
        </style>
        <button id="show-ranking" style="position:fixed;top:10px;right:100px" onclick="scaylaRanking()">#rank</button>
        <div id="qc" style="display: none"><h1>Questions? Comments?</h1><ul id="times"></ul></div>
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
        laterIds.push(i);
    }
    console.log(laterIds)

    $("#next-in-scayla-button").click(function() {
        closeAll();
        setTimeout(() => {
            if (scaylaDailyIndex >= 0) {
                currentTime(scaylaDailyIndex);
            }
            scaylaDailyIndex = nextIndex(scaylaDailyIndex);

            if (laterIds[scaylaDailyIndex] !== undefined) {
                expandItem(scaylaDailyIndex)
                nextInScayla(scaylaDailyIndex);
            } else {
                console.log('Reached the end of Daily');
                $("#scayla-notify-next").removeClass('show');
                $("#next-in-scayla-name").html('Finished.');
                $("#next-in-scayla-button").attr('disabled', true);
                $("body").removeClass('daily-time');
                $("#qc").show().addClass('show');

                window.scaylaRank && showTimes();

                $("#next-in-scayla").fadeOut(8000, () => {
                  setTimeout(function() {
                    window.location.reload();
                  }, 10000);
                });
            }
        }, 100);
    }).trigger('click');

    $('#next-and-then').html(andThenOptions.yes);
});

function currentTime(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + laterIds[index] + ")")
    const name = getFunnyName(item.find('.ghx-heading span[role="button"]').html());
    const time = Math.floor((+(new Date()) - previousClick) / 1000);
    times["_" + index] = {name: name, time: time};
    previousClick = +(new Date());
    $("#previous-in-scayla-name").html(name).parent().show();
    $("#previous-in-scayla-time")
        .html(' (' + time + 's)').toggleClass('danger', time >= 60).toggleClass('success', time <= 20);

}

function expandItem(index) {

    const item = $("#ghx-pool .ghx-swimlane:eq(" + laterIds[index] + ")")
    const name = item.find('.ghx-heading span[role="button"]').html();

    item.find('.js-expander').click();
    $("#subnav-title").html(getFunnyName(name));
    $("#ghx-board-name").html('Now speaking:');
    setTimeout(() => item[0].scrollIntoView(), 50);
    notifyCurrent(laterIds[index]);

}

function nextInScayla(index) {


    const item = $("#ghx-pool .ghx-swimlane:eq(" + laterIds[index + 1] + ")");
    const andThen = $("#ghx-pool .ghx-swimlane:eq(" + laterIds[index + 2] + ")");
    const name = getFunnyName(item.find('.ghx-heading span[role="button"]').html());
    const andThenName = getFunnyName(andThen.find('.ghx-heading span[role="button"]').html());

    console.log(index, laterIds[index], laterIds[index + 1], laterIds[index + 2])
    $('#next-in-scayla-and-then').removeClass('right-after');

    $("#next-in-scayla-name").html(checkbox + '<b id="next_b">' + name + '</b>');
    if (laterIds[index + 1] === undefined) {
      $("#next-in-scayla-name").html('');
      $("#next-in-scayla-button").html('Finish Daily');
    } else {
      if (laterIds[index + 2] === undefined) {
        $("#next-in-scayla-and-then").html('&nbsp;');
      } else {
        $("#next-in-scayla-and-then-name").html(andThenName);
      }
    }

}

function closeAll() {
    $("#ghx-pool .ghx-swimlane:not(.ghx-closed) .js-expander").click();
}

function notifyCurrent(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + laterIds[index] + ")");
    const name = getFunnyName(item.find('.ghx-heading span[role="button"]').html());
    const src = item.find('.ghx-avatar > img').attr('src');
    console.log('user image', src);
    clearTimeout(nextInScaylaTimeout);
    clearTimeout(laterInScaylaTimeout);
    $("#scayla-notify-next-name").html('Now: <b>' + name + '</b>');
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

function getFunnyName(name) {
    if (!name) {
        return '';
    }
    if (name.match(/ommeli/)) {
        return 'El Bommeli';
    }
    return name;
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
    laterIds.push(laterIds[scaylaDailyIndex]);
    console.log(scaylaDailyIndex, laterIds[scaylaDailyIndex], laterIds);
    $("#next-in-scayla-button").trigger('click');
})

function nextIndex(index) {
    if (isNext()) {
        return index + 1;
    } else {
        return index + 2;
    }
}

function showTimes() {
    const sortedTimes = Object.values(times).sort((a, b) => b.time - a.time);
    const sortedTimesHTML = [];
    for (let i = 0; i < sortedTimes.length; ++i) {
        sortedTimesHTML.push('<li>' + sortedTimes[i].name + ': <b>' + sortedTimes[i].time + 's</b></li>');
    }
    $("#times").html(sortedTimesHTML.join(''));
}

function scaylaRanking() {
  console.log('Will show the ranking');
  window.scaylaRank = true;
}

function isNext() {
    return (!$("#next_cb").length || $("#next_cb:checked").length === 1);
}
