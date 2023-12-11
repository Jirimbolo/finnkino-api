
// 1. Aloitetaan projekti tekemällä request funktio, joka hakee APIsta dataa
// tarvitaan teatterin nimi sekä id
function getTheaters() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://www.finnkino.fi/xml/TheatreAreas/", true);
    xmlhttp.send();
    // Sitten jännitetään
    xmlhttp.onreadystatechange = function () {
        // Onnistuessaan haku suorittaa seuraavanlaista
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // luodaan xml request objekti 
            var xmlDoc = xmlhttp.responseXML;
            // tehdään muuttuja, jolla napataan kaikki teatterit
            var allTheaters = xmlDoc.getElementsByTagName("TheatreArea");
            // for looppi aloittaa toisella indexillä olevasta, jotta jätetään "valitse teatteri" areana pois 
            // tämä ehkä liippaa läheltä hardcodingia
            for (i = 1; i < allTheaters.length; i++) {
                // haetusta datasta talletetaan nimi ja id
                const theaterName = allTheaters[i].getElementsByTagName("Name")[0].textContent;
                const theaterId = allTheaters[i].getElementsByTagName("ID")[0].textContent;
                // luodaan dynaamisesti listItem elementti johon nimi ja id talletataan
                const liElement = createButtonList(theaterName, theaterId);
                //Siirretty omaan metodiinsa (refaktorointi global scopea käyttäen)
                //valmis paketti html elementtiin
                document.getElementById("theaterList").appendChild(liElement);
            }
        }
    }
}


// 2. Luodaan omassa metodissaan funktio, joka rakentaa teatterilistan nappeina kerätystä tiedosta
function createButtonList(theaterName, theaterId) {
    //luodaan listaelementti
    var liElement = document.createElement("li");
    //attribuuttien määrittely
    liElement.setAttribute("id", "theaterItem" + theaterId);
    //luodaan button elementti
    var buttonElement = document.createElement("button");
    //asetetaan button elementin attribuutit
    buttonElement.innerHTML = theaterName;
    buttonElement.setAttribute("type", "button");
    buttonElement.setAttribute("onclick", "showMovies(" + theaterId + ")");
    //lisätään juuri luotu button element list itemin sisään
    liElement.appendChild(buttonElement);
    // viedään lista teattereista html:n puolelle
    return liElement;
}


// 3. Tehdään funktio, joka noutaa tarvittavan datan elokuvien näyttämiseksi halutulla tavalla
function showMovies(theaterId) {
    //määritellään muuttuja theaterItemEl joka sulkee toistamiseen painettavan napin/poistaa "lapset"
    const theaterItemEl = document.getElementById("theaterItem" + theaterId);
    // tässä lasketaan, kuinka monta kertaa nappia käytännössä on painettu
    let numb = document.getElementById("theaterItem" + theaterId).childElementCount;
    // jos nappia on painettu enemmän kuin kerran poistetaan kaikki paitsi ensimmäinen child, jotta nappi jää paikalleen
    if (numb > 1) {
        theaterItemEl.lastChild.remove();
    } else {
        // Jos nappia ei ole painettu tehdään jälleen requesti apille, mutta tällä kertaa hieman modatulla urlilla + teatterin id:llä
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "https://www.finnkino.fi/xml/Schedule/?area=" + theaterId, true);
        xmlhttp.send();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var xmlDoc = xmlhttp.responseXML;
                //haetaan data shown alta ja tehdään muuttuja jolle kaikki voidaan tallentaa
                var allMovies = xmlDoc.getElementsByTagName("Show");
                //luodaan tauluelementti
                const tableElement = document.createElement("table");
                //for looppi looppaa tarvittavat asiat, nimi, kuva, näytösaika sekä teatterin nimi ja sali
                for (i = 0; i < allMovies.length; i++) {
                    // Leffan nimi
                    const name = allMovies[i].getElementsByTagName("Title")[0].textContent;
                    // linkki talteen kuvaa varten
                    const imageLink = allMovies[i].getElementsByTagName("EventSmallImagePortrait")[0].textContent;
                    // näytösajat
                    const showTimeRaw = allMovies[i].getElementsByTagName("dttmShowStart")[0].textContent;
                    // parsitaan näytösaika nätimpään muotoon
                    const showTime = new Date(Date.parse(showTimeRaw)).toLocaleString('fi-FI');
                    // teatteri
                    const theatre = allMovies[i].getElementsByTagName("Theatre")[0].textContent;
                    // sali
                    const auditorium = allMovies[i].getElementsByTagName("TheatreAuditorium")[0].textContent;
                    //sisälletään data muuttujaan jatkojalostusta varten
                    var movieRow = createMovieRow(name, imageLink, showTime, theatre, auditorium);
                    // ja lisätään data muuttujaan
                    tableElement.appendChild(movieRow);
                }
                // Siirretään data napin painalluksesta tauluElementille
                document.getElementById("theaterItem" + theaterId).appendChild(tableElement);
            }
        }
    }
}
// 4. Tehdään funkio, joka muodostaa tauluun rivin sisältäen kerätyn datan.
function createMovieRow(movieName, imageLink, showTime, theatre, auditorium) {
    // luodaan elementti tableRow
    var rowElement = document.createElement("tr");
    // Kuvan muotoilu niin, että tuloksena tulee kuva eikä linkki
    const imageElement = document.createElement("td");
    const imageSource = document.createElement("img");
    // annetaan attribuutiksi linkki kuvaan
    imageSource.setAttribute("src", imageLink);
    imageElement.appendChild(imageSource);
    // luodaan elementti nimelle
    const nameElement = document.createElement("td");
    nameElement.innerHTML = movieName;
    // luodaan elementti näytösajalle
    const showTimeElement = document.createElement("td");
    showTimeElement.innerHTML = showTime;
    // luodaan elementti teatterille
    const theatreElement = document.createElement("td");
    theatreElement.innerHTML = theatre;
    // ja luodaan vielä elementti myös salille
    const theatreAuditoriumElement = document.createElement("td");
    theatreAuditoriumElement.innerHTML = auditorium;
    //kun muuttujat on tehty lisätään data sisään halutussa järjestyksessä muuttujaan
    rowElement.appendChild(imageElement);
    rowElement.appendChild(nameElement);
    rowElement.appendChild(showTimeElement);
    rowElement.appendChild(theatreElement);
    rowElement.appendChild(theatreAuditoriumElement);
    // ja näin voidaan tulostaa elokuvan infot
    return rowElement;
}
//automaattinen teattereiden hakeminen ja näyttäminen sivun avatessa
getTheaters();
