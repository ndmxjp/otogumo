
// var iframeElement   = document.querySelector('iframe');
// var iframeElementID = iframeElement.id;
// var widget1         = SC.Widget(iframeElement);
// var widget2         = SC.Widget(iframeElementID);
SC.initialize({
  client_id: '1dfbd2163b26d9e6083d76580b4fe86d'
});

var iframeElement   = document.querySelector('iframe');
var widget          = SC.Widget(iframeElement);
var track_list      = [];

const Mode = {
  LOOP: 'loop',
  ONECE: 'onece'
}

class Player {
  constructor() {
      this.track_list = [];
      this.current_idx = 0;
      this.state = Mode.Loop;
      this.load();
  }

  onecePlay() {
    this.state = Mode.ONECE;
  }

  getNextTrack() {
    if (this.state == Mode.loop) {
      this.current_idx = (this.current_idx + 1) % this.track_list.length
      return this.track_list[this.current_idx];
    }
  }

  setCurrentIndex(idx) {
    this.current_idx = idx;
    this.state =  Mode.loop
  }

  addPlaylist(track) {
    this.track_list.push(track);
    this.save(this.track_list);
  }

  deletePlaylist(idx) {
    this.track_list.splice(idx, 1);
    this.save(this.track_list);
  }

  save(playlist) {
    localStorage.setItem("playlist", JSON.stringify(playlist));
  }

  load() {
    this.track_list = localStorage.getItem("playlist") == null ? [] : JSON.parse(localStorage.getItem("playlist"));
  }
}

const player = new Player(playlist);



$(document).ready(function(){


  // localStorageの値でplaylistのdomを初期化
  var list_dom = player.track_list.map(function(e, index) {
    // return `<li>${e.title}</li>`;
    return `<tr><th scope="row">${index}</th>
            <td><image src="${e.artwork_url}"></image></td>
            <td>${e.title}</td>
            <td><button class="btn btn-primary dlete-btn" type="button">delete</button></td></tr>`
  });
  $('#playlist').append(list_dom);

  // 検索ボタンがおされた時のイベント
  $(document).on('click', '#search-btn', function(){
    $('.list-group-flush').empty();
    var search_text = $('#input-txt').val();

    SC.get('/tracks', {
      q: search_text, limit: 20, linked_partitioning: 1
    }).then(function(json) {
      track_list = json["collection"];
      console.log(json);
      track_list.forEach(function(item){
        $('.list-group-flush').append(
          `<li class="list-group-item">
            <div class="row track-list">
              <div class="col-lg-2">
                <img src="${item.artwork_url}"></img>
              </div>
              <div class="col-lg-8">
                ${item.title}
              </div>
              <div class="col-lg-2">
                <button class="btn btn-primary add-playlist-btn" type="button">Add Playlist</button>
              </div>
            </div>
          </li>`
        );
      });

    });
  });

  function removeClassTableActive() {
    $('.list-group-item > .row').each(function(idx, e){
      $(e).removeClass('table-active');
    });

    $('tr').each(function(idex, e){
      $(e).removeClass('table-active');
    });
  }

  //cardが押された時のイベント
  $(document).on('click','.track-list', function(event) {
    var index = $('.list-group-item > .row').index(this);
    widget.load(track_list[index].uri, {auto_play : true});

    removeClassTableActive();

    $(this).addClass('table-active');
    console.log($(p));
    player.onecePlay();
  });

  //add playlistボタンが押された時のイベント
  $(document).on('click', '.add-playlist-btn', function(event) {
    var index = $('.add-playlist-btn').index(this);
    var target = track_list[index];
    player.addPlaylist(target);
    var size = player.track_list.length -1;
    $('#playlist').append(`<tr><th scope="row">${size}</th>
            <td><image src="${target.artwork_url}"></image></td>
            <td>${target.title}</td>
            <td><button class="btn btn-primary dlete-btn" type="button">delete</button></td></tr>`
          )

    $('.modal').modal('show');
    setTimeout(function(){
      $('.modal').modal('hide');
      console.log('time out');
    }, 1.0);
    return false;
  });

  $(document).on('click', 'tr', function() {
    var index = $('tr').index(this) -1;
    widget.load(player.track_list[index].uri, {auto_play: true});
    player.setCurrentIndex(index);
    removeClassTableActive();

    $(this).addClass('table-active');
  });

  $(document).on('click', '.dlete-btn', function() {
    var index = $('.dlete-btn').index(this);
    player.deletePlaylist(index);
    var row = $(this).closest("tr").remove();
    $(row).remove();
    return false;
  });

  $(document).on('click', '.play-btn', function() {
    widget.play();
  });

  $(document).on('click', '.stop-btn', function() {
    widget.pause();
  })

  widget.bind(SC.Widget.Events.FINISH, function(){
    next_track = player.getNextTrack();
    if (player.state == Mode.loop) {
      widget.load(next_track.uri, {auto_play: true});
    }
  });


});
