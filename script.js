let scaylaDailyIndex = -1;
const UNASSIGNED = 'Unassigned';
let previousClick = +(new Date());
let nextInScaylaTimeout;

let nicoHolidays = {
	day: 180,
	text: "Hello! I'm on holidays until Wednesday. My daily: friday I fixed the `hasChildren` from Attachments (scayla-2776) and a Metadata problem that was high priority."
};

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
		  }
          #next-in-scayla-box {
          	display: flex;
          	flex-direction: row;
          	align-items: center;
          }
          #next-in-scayla-name {
            padding-right: 20px;
          }
          #next-in-scayla-and-then, #previous-in-scayla-box {
            opacity: 0.3;
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
        </style>
        <div id="next-in-scayla" class="scayla-popup">
            <span id="previous-in-scayla-box" style="display: none">
              Before: <span id="previous-in-scayla-name"></span> <b id="previous-in-scayla-time"></b>
            </span>
            <span id="next-in-scayla-box">
	            <span id="next-in-scayla-name"></span>
	            <button
	              id="next-in-scayla-button"
	              class="aui-button aui-button-primary aui-style"
	              >Next</button>
	        </span>
            <span id="next-in-scayla-and-then">
               And then:
               <span id="next-in-scayla-and-then-name"></span>
            </span>
        </div>
        <div id="scayla-notify-next" class="scayla-popup">
          <img id="scayla-notify-next-img"/>
          <span id="scayla-notify-next-name"></span>
        </div>
        `);

    $("#ghx-operations").hide();

    $("#next-in-scayla-button").click(function() {
        closeAll();
        setTimeout(() => {
        	if (scaylaDailyIndex >= 0) {
            	currentTime(scaylaDailyIndex);
        	}
            ++scaylaDailyIndex;
            expandItem(scaylaDailyIndex)
            nextInScayla(scaylaDailyIndex);
        }, 100);
    }).trigger('click');
});

function currentTime(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + index + ")")
    const name = getFunnyName(item.find('.ghx-heading span[role="button"]').html());
    const time = Math.floor(( +(new Date()) - previousClick )/1000);
    previousClick = +(new Date());
    $("#previous-in-scayla-name").html(name).parent().show();
    $("#previous-in-scayla-time")
    	.html(' (' + time + 's)').toggleClass('danger', time >= 60).toggleClass('success', time <= 20);
    //item.find('.ghx-description')
}

function expandItem(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + index + ")")
    const name = item.find('.ghx-heading span[role="button"]').html();
    if (name === UNASSIGNED) {
        $("#next-in-scayla-name").html('Finished.');
        $("#next-in-scayla-button").attr('disabled', true);
        $("#next-in-scayla").fadeOut(8000, () => {
            window.location.reload();
        });
        $("body").removeClass('daily-time');
    } else {
        item.find('.js-expander').click();
        $("#subnav-title").html(getFunnyName(name));
        $("#ghx-board-name").html('Now speaking:');
        setTimeout(() => item[0].scrollIntoView(), 50);
        notifyCurrent(index);
    }
}
function nextInScayla(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + (index + 1) + ")");
    const andThen = $("#ghx-pool .ghx-swimlane:eq(" + (index + 2) + ")");
    const name = getFunnyName(item.find('.ghx-heading span[role="button"]').html());
    const andThenName = getFunnyName(andThen.find('.ghx-heading span[role="button"]').html());
    if (name === UNASSIGNED || !name) {
        $("#next-in-scayla-name").html('Finish daily');
    } else {
        $("#next-in-scayla-name").html('Next: <b>' + name + '</b>');
        if (andThenName === UNASSIGNED) {
          $("#next-in-scayla-and-then").remove();
        } else {
          $("#next-in-scayla-and-then-name").html(andThenName);
        }
    }
}

function closeAll() {
    $("#ghx-pool .ghx-swimlane:not(.ghx-closed) .js-expander").click();
}

function notifyCurrent(index) {
	const item = $("#ghx-pool .ghx-swimlane:eq(" + (index) + ")");
	const name = getFunnyName(item.find('.ghx-heading span[role="button"]').html());
	const src = item.find('.ghx-avatar > img').attr('src');
	console.log('user image', src);
	clearTimeout(nextInScaylaTimeout);
	$("#scayla-notify-next-name").html('Now: <b>' + name + '</b>');
    $("#scayla-notify-next").addClass('show');
    $("#scayla-notify-next-img").attr('src', src);
    nextInScaylaTimeout = setTimeout(function() {
      $("#scayla-notify-next").removeClass('show');
    }, 5000);

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
