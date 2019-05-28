/**Semantic UI: https://semantic-ui.com/
 * UI 라이브러리 
 * 
 * 공공 데이터 포털: https://www.data.go.kr/
*/

// 차트 영역 전역변수
var mainChart;

//공공 데이터 포털 API 키
const apiKey = "XhXiG2pChFoykZr1Sz1RBgGvUl20R2375kgljXL%2BNMF28m0UuCZk3O%2B65FIuVgIq8yOovXLhiz9St6Br1OULtQ%3D%3D";

// 현재 클릭된 메뉴를 구분하기 위한 전역변수
var currentMenu = 0;

// html 문서가 로드가 완료되었을때
$(document).ready(() => {

    /** 상단 메뉴 초기화(Semantic UI 라이브러리 메뉴 기본 초기화 함수)
     * https://semantic-ui.com/collections/menu.html
     * https://semantic-ui.com/modules/tab.html#/usage
    */
    $('.menu .item').tab();

    // 검색바 애니메이션 효과 적용(우측에서 날라오기) - 검색바 너비(픽셀) 만큼 우측 숨겨진 영역에서 이동해 옴
    const search_box = $('#search_box');
    search_box.css({ transform: `translateX(${search_box[0].clientWidth}px)` });

    // Chart.js 기본 차트 구조 생성하는 함수
    makeChart();
    chartAction.hide("데이터를 불러오는 중...", "");

    // 처음 로드 되었을 때 전국 미세먼지 데이터를 보여줄 것이므로 상단의 첫번째 메뉴를 클릭해 줌
    $('.item[data=0]').click();
});

// 상단의 메뉴를 클릭했을 때 이벤트
var menuOnClick = e => {

    // 클릭한 메뉴가 어떤 메뉴인지
    const target = e.target;

    // 검색바 id (getElementById()와 동일한 jQuery 문법)
    const search_box = $('#search_box');

    // 탭 클릭 시 클릭한 메뉴에 active 클래스를 추가함으로 활성화 되었음을 진하게 표시해 준다
    $(target).addClass('active');

    // 나머지 메뉴(siblings)들은 active 클래스를 제거해 준다
    $(target).siblings().removeClass('active');

    // 24시간 전국 데이터 테이블을 감춤
    tabPaneAction.removeTabPane();

    // 첫 번째 메뉴를 클릭한 경우 전국의 데이터 보여주기
    if ($(target).attr('data') === "0") {

        // 공공 데이터 포털로 미세먼지 데이터를 요청하기 위해 필요한 정보들을 설정
        let options = {
            baseUrl: "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureLIst", // 요청 보낼 주소
            numOfRows: "10", // 한 번에 받아올 데이터 개수
            pageNo: "1", // 열람할 페이지 번호(1번부터 시작, 총 30개의 데이터가 있는 경우는 10개씩 총 3페이지가 됨)
            itemCode: "PM10", // 가져올 기상 데이터 종류(PM10: 미세먼지, PM25: 초미세먼지)
            dataGubun: "HOUR", // 실시간 데이터를 가져올 것이므로 HOUR(하루 평균은 DAILY)
            searchCondition: "WEEK" // 전체 데이터는 한 주간 데이터를 가져옴(한달은 MONTH)
        }
        console.log("전국");

        // 첫 번째 메뉴(전국)를 클릭한 경우는 검색이 필요 없으므로 검색바를 숨김(우측으로 검색바 너비 만큼 이동)
        search_box.css({ transform: `translateX(${search_box[0].clientWidth}px)` });

        // 현재 선택한 메뉴는 0(첫 번째임)
        currentMenu = 0;

        // 옵션으로 데이터를 받아와서 차트를 업데이트 해 주는 함수를 호출함
        updateChart(options);
    }

    // 두 번째 메뉴를 클릭한 경우 시군구별(서울로 검색하면 서울시의 각 구의 데이터를 보여줌) 데이터를 보여줌
    else if ($(target).attr('data') === "1") {
        console.log("시군구별");

        // 검색해야 하므로 검색바를 보여준다
        search_box.css({ transform: `translateX(0)` });

        // 검색바 placeholder를 변경
        search_box.children().attr("placeholder", "시, 도 검색");

        // 검색하기 전에는 차트 영역에 차트를 감추고 설명을 보여준다
        chartAction.hide("우측 상단의 검색바를 이용해서 검색해 주세요.", "예: 서울");
        chartAction.pending.release();
        currentMenu = 1;
    }

    // 세 번째 메뉴를 클릭한 경우 측정소별(강남구) 데이터를 보여줌
    else if ($(target).attr('data') === "2") {
        console.log("측정소별");

        // 세 번째 메뉴 역시 검색이 필요하므로 검색바를 보여줌
        search_box.css({ transform: `translateX(0)` });
        search_box.children().attr("placeholder", "측정소명 검색");
        chartAction.hide("우측 상단의 검색바를 이용해서 검색해 주세요.", "예: 강남구");
        chartAction.pending.release();
        currentMenu = 2;
    }

    // 잘못된 메뉴나 명령인 경우
    else {
        console.error("잘못된 명령입니다.");
        search_box.css({ transform: `translateX(${search_box[0].clientWidth}px)` });
        search_box.children().attr("placeholder", "Search...");
        chartAction.hide("잘못된 명령입니다.", "");
        currentMenu = -1;
    }
}

// 아이템 클래스를 가진 요소들에게 클릭 이벤트를 부여해 줌(jQuery 이벤트 등록)
$(document).on('click', '.ui.secondary.menu > .item', menuOnClick);


// 검색 이벤트
var searchAction = e => {

    // 검색바와 검색바의 값을 가져옴
    const target = e.target;
    const value = target.value;

    // 공공 데이터 포털에 요청할 데이터을 위한 옵션 변수
    let options = {}

    // 현재 선택한 메뉴가 전국인 경우 검색이 필요 없음
    if (currentMenu === 0) {

    }

    // 시군구별 검색인 경우 다음과 같은 옵션 지정
    else if (currentMenu === 1) {
        options = {
            baseUrl: "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst",
            numOfRows: "10",
            pageNo: "1",
            sidoName: value,
            searchCondition: "HOUR"
        }
    }

    // 측정소별 검색인 경우
    else if (currentMenu === 2) {
        options = {
            baseUrl: "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty",
            numOfRows: "10",
            pageNo: "1",
            stationName: value,
            dataTerm: "DAILY",
            ver: "1.3"
        }
    }

    else {
        alert("잘못된 접근입니다!");
    }

    // 엔터키 입력시 현재 메뉴에 대한 옵션으로 공공 데이터 포털에서 데이터를 가져와 차트에 보여주는 updateChart 함수를 호출함
    if (e.which == 13) {
        console.log(value);
        updateChart(options)
    };
}

// 검색바에 키 입력 이벤트를 지정함
$(document).on('change', '#search_box > input', searchAction).on('keyup', '#search_box > input', searchAction);


// 공공 데이터 포털에서 데이터를 가져와서 차트에 보여주는 함수
var updateChart = async (options) => {

    // 데이터 가져올 때 로딩중 이라는 화면을 보여줌
    chartAction.pending.set();

    // 차트 데이터로 쓸 변수 설정
    let pData = {
        names: [],
        pm10: [],
        pm25: [],
    }

    // 페이지당 검색 결과 수
    let numOfRows = parseInt(options.numOfRows);

    // 데이터를 10개씩 가져오는데, 첫 세트를 배열 처음 값에 넣는다
    let data = new Array(xmlToJson(await getData(apiKey, options)));

    // 전체 데이터 개수
    let totalCount = parseInt(data[0].response.body.totalCount['#text']);

    // 전체 페이지 수
    let totalPages = parseInt(totalCount / numOfRows);

    // 마지막 페이지에 남은 데이터 개수
    let lastRemains = totalCount % numOfRows;

    // 남은 데이터가 있는 경우에 페이지 수 하나 추가(10개씩 35개면 총 페이지수는 4가 됨)
    if (lastRemains > 0) totalPages++;

    // 2번째 페이지부터 10개씩 가져와서 배열에 저장함
    for (var i = 2; i <= totalPages; i++) {
        options.pageNo = `${i}`;
        data.push(xmlToJson(await getData(apiKey, options)));
    }

    // 현재 선택한 메뉴가 전국인 경우
    if (currentMenu === 0) {

        // 24시간 전국 미세먼지 및 초미세먼지 데이터 테이블을 위한 탭을 만드는 변수
        var tabdata = {
            counts: 2, // 탭 수
            tabnames: ['미세먼지', '초미세먼지'], // 탭 이름
            active: 0 // 초기 활성 탭 지정
        };

        // 옵션으로 탭 페이지를 만듦
        tabPaneAction.makeTabPane('.ui.segment', tabdata);

        // 미세먼지 테이블 데이터
        var pm10TableData = {
            title: "24시간 미세먼지(PM 10) 데이터",
            title_deco: " (단위: ㎍/m³)",
            columns: ["서울", "경기", "인천", "강원", "세종", "충북", "충남", "대전", "경북", "경남", "대구", "울산", "부산", "전북", "전남", "광주", "제주"],
            rows: [],
            datas: []
        };

        // 초미세먼지 테이블 데이터
        var pm25TableData = {
            title: "24시간 초미세먼지(PM 2.5) 데이터",
            title_deco: " (단위: ㎍/m³)",
            columns: ["서울", "경기", "인천", "강원", "세종", "충북", "충남", "대전", "경북", "경남", "대구", "울산", "부산", "전북", "전남", "광주", "제주"],
            rows: [],
            datas: []
        };

        console.log(data);

        // 테이블 데이터를 위해 공공 데이터 포탈에서 받아온 데이터를 좀 더 보기 좋게 가공하는 함수 호출
        var refinedData = refineJsonData(data);

        // 미세먼지 데이터를 테이블 데이터 변수에 넣음
        for (var i = 0; i < refinedData.length; i++) {
            pm10TableData.rows.push(refinedData[i].dataTime);
            pm10TableData.datas.push([refinedData[i].seoul, refinedData[i].gyeonggi, refinedData[i].incheon, refinedData[i].gangwon, refinedData[i].sejong, refinedData[i].chungbuk, refinedData[i].chungnam, refinedData[i].daejeon, refinedData[i].gyeongbuk, refinedData[i].gyeongnam, refinedData[i].daegu, refinedData[i].ulsan, refinedData[i].busan, refinedData[i].jeonbuk, refinedData[i].jeonnam, refinedData[i].gwangju, refinedData[i].jeju]);
        }

        // 만든 데이터로 테이블을 탭 페이지 0번째에 생성함
        tableAction.makeTable('.tab.segment[data-tab="tab_0"]', pm10TableData);

        // 결과가 0을 반환한 경우 값이 없는 것이므로 에러 출력
        if (data[0].response.body.totalCount['#text'] === "0") {
            chartAction.hide("결과가 없습니다.", "일시적인 문제일 수도 있습니다.<br>잠시 후 다시 시도해주세요.");
            chartAction.pending.release();
            return;
        }

        // 가져온 미세먼지 데이터가 어느 시간대의 데이터인지
        let dataTime;

        // 데이터 조회를 위한 변수
        let src;

        // 받아온 데이터가 배열타입인 경우
        if (Array.isArray(data[0].response.body.items.item)) {
            dataTime = data[0].response.body.items.item[0].dataTime['#text'];
            src = data[0].response.body.items.item[0];
        }

        // 받아온 데이터가 객체인 경우(결과값이 하나만 반환되는 경우 배열이 아닌 객체로 반환됨)
        else {
            dataTime = data[0].response.body.items.item.dataTime['#text'];
            src = data[0].response.body.items.item;
        }

        // 우선적으로 미세먼지(pm10) 데이터만 가져온 것이므로 pm25는 비워둔다
        // 차트에 넣을 각 그래프의 레이블과 미세먼지 데이터(pm10) 값을 세팅
        pData.names = ["서울", "경기", "인천", "강원", "세종", "충북", "충남", "대전", "경북", "경남", "대구", "울산", "부산", "전북", "전남", "광주", "제주"],
            pData.pm10 = [src.seoul['#text'], src.gyeonggi['#text'], src.incheon['#text'], src.gangwon['#text'], src.sejong['#text'], src.chungbuk['#text'], src.chungnam['#text'], src.daejeon['#text'], src.gyeongbuk['#text'], src.gyeongnam['#text'], src.daegu['#text'], src.ulsan['#text'], src.busan['#text'], src.jeonbuk['#text'], src.jeonnam['#text'], src.gwangju['#text'], src.jeju['#text']];

        // 초미세먼지(pm2.5) 데이터를 받기 위해 옵션 값 재설정
        options.itemCode = "PM25";
        options.pageNo = "1";

        // 위와 동일한 과정으로 초미세먼지 데이터를 받아옴
        numOfRows = parseInt(options.numOfRows);
        data = new Array(xmlToJson(await getData(apiKey, options)));
        totalCount = parseInt(data[0].response.body.totalCount['#text']);
        totalPages = parseInt(totalCount / numOfRows);
        lastRemains = totalCount % numOfRows;

        if (lastRemains > 0) totalPages++;

        for (var i = 2; i <= totalPages; i++) {
            options.pageNo = `${i}`;
            data.push(xmlToJson(await getData(apiKey, options)));
        }

        console.log(data);

        // 초미세먼지 테이블 데이터(미세먼지의 경우와 동일)
        var refinedData = refineJsonData(data);

        for (var i = 0; i < refinedData.length; i++) {
            pm25TableData.rows.push(refinedData[i].dataTime);
            pm25TableData.datas.push([refinedData[i].seoul, refinedData[i].gyeonggi, refinedData[i].incheon, refinedData[i].gangwon, refinedData[i].sejong, refinedData[i].chungbuk, refinedData[i].chungnam, refinedData[i].daejeon, refinedData[i].gyeongbuk, refinedData[i].gyeongnam, refinedData[i].daegu, refinedData[i].ulsan, refinedData[i].busan, refinedData[i].jeonbuk, refinedData[i].jeonnam, refinedData[i].gwangju, refinedData[i].jeju]);
        }

        tableAction.makeTable('.tab.segment[data-tab="tab_1"]', pm25TableData);

        if (Array.isArray(data[0].response.body.items.item)) {
            src = data[0].response.body.items.item[0];
        }
        else {
            src = data[0].response.body.items.item;
        }

        // 초미세먼지 데이터 값들 저장
        pData.pm25 = [src.seoul['#text'], src.gyeonggi['#text'], src.incheon['#text'], src.gangwon['#text'], src.sejong['#text'], src.chungbuk['#text'], src.chungnam['#text'], src.daejeon['#text'], src.gyeongbuk['#text'], src.gyeongnam['#text'], src.daegu['#text'], src.ulsan['#text'], src.busan['#text'], src.jeonbuk['#text'], src.jeonnam['#text'], src.gwangju['#text'], src.jeju['#text']];

        // 차트 제목 설정
        mainChart.options.title.text = `${dataTime} 전국 미세먼지, 초미세먼지`;
    }

    // 현재 메뉴가 시군구별인 경우
    else if (currentMenu === 1) {

        // 데이터 수가 0이 반환된 경우 에러 출력
        if (data[0].response.body.totalCount['#text'] === "0") {
            chartAction.hide("검색 결과가 없습니다.", "키워드가 올바른지 확인하세요.");
            chartAction.pending.release();
            return;
        }

        // 미세먼지 데이터 시간대 받아오기
        let dataTime;
        if (Array.isArray(data[0].response.body.items.item))
            dataTime = data[0].response.body.items.item[0].dataTime['#text'];
        else
            dataTime = data[0].response.body.items.item.dataTime['#text'];

        // 전체 데이터 중 필요한 부분만(미세먼지, 초미세먼지) 변수에 저장
        for (var i = 0; i < data.length; i++) {
            const src = data[i].response.body.items.item;

            // 배열인 경우(위와 동일한 조건)
            if (Array.isArray(src)) {
                for (var j in src) {

                    // 시, 군 이름
                    pData.names.push(src[j].cityName['#text']);

                    // 미세먼지
                    pData.pm10.push(src[j].pm10Value['#text']);

                    // 초미세먼지
                    pData.pm25.push(src[j].pm25Value['#text']);
                }
            }

            // 객체인 경우
            else {
                pData.names.push(src.cityName['#text']);
                pData.pm10.push(src.pm10Value['#text']);
                pData.pm25.push(src.pm25Value['#text']);
            }
        }

        console.log(pData);

        mainChart.options.title.text = `${dataTime} ${options.sidoName} 미세먼지, 초미세먼지`;
    }

    // 현재 메뉴가 측정소별인 경우
    else if (currentMenu === 2) {

        // 데이터 수가 0이 반환된 경우 에러 출력
        if (data[0].response.body.totalCount['#text'] === "0") {
            chartAction.hide("검색 결과가 없습니다.", "키워드가 올바른지 확인하세요.");
            chartAction.pending.release();
            return;
        }

        // 미세먼지 데이터 시간대 받아오기
        let dataTimeStart;
        let dataTimeEnd;
        let itm = data[data.length - 1].response.body.items.item;
        if (Array.isArray(itm))
            dataTimeStart = itm[itm.length - 1].dataTime['#text'];
        else
            dataTimeStart = itm.dataTime['#text'];

        itm = data[0].response.body.items.item;

        if (Array.isArray(itm))
            dataTimeEnd = itm[0].dataTime['#text'];
        else
            dataTimeEnd = itm.dataTime['#text'];

        // 전체 데이터 중 필요한 부분만(미세먼지, 초미세먼지) 변수에 저장
        for (var i = 0; i < data.length; i++) {
            const src = data[i].response.body.items.item;

            // 배열인 경우(위와 동일한 조건)
            if (Array.isArray(src)) {
                for (var j in src) {

                    // 시, 군 이름
                    pData.names.push(src[j].dataTime['#text']);

                    // 미세먼지
                    pData.pm10.push(src[j].pm10Value['#text']);

                    // 초미세먼지
                    pData.pm25.push(src[j].pm25Value['#text']);
                }
            }

            // 객체인 경우
            else {
                pData.names.push(src.dataTime['#text']);
                pData.pm10.push(src.pm10Value['#text']);
                pData.pm25.push(src.pm25Value['#text']);
            }
        }

        console.log(pData);

        mainChart.options.title.text = `${dataTimeStart} ~ ${dataTimeEnd} ${options.stationName} 미세먼지, 초미세먼지`;
    }

    // 차트 데이터 이름
    mainChart.data.labels = pData.names;

    // 데이터셋 1에 미세먼지 데이터
    mainChart.data.datasets[0].data = pData.pm10;

    // 데이터셋 2에 초미세먼지 데이터
    mainChart.data.datasets[1].data = pData.pm25;

    // 미세먼지 및 초미세먼지 데이터 값에 따른 막대 채움 색 지정
    mainChart.data.datasets[0].backgroundColor = makeColorSet(pData.pm10, 0).background;
    mainChart.data.datasets[1].backgroundColor = makeColorSet(pData.pm25, 1).background;

    // 막대 선 색 지정
    mainChart.data.datasets[0].borderColor = makeColorSet(pData.pm10, 0).border;
    mainChart.data.datasets[1].borderColor = makeColorSet(pData.pm25, 1).border;

    // 모든 데이터가 세팅되었으면 로딩 창을 해제하고 차트를 보여주고 업데이트 해 준다.
    chartAction.pending.release();

    chartAction.show();
    chartAction.update();
}

// 공공 데이터 포털로 요청을 보내 데이터를 받아오는 핵심 함수
var getData = (apikey, options) => {

    // 동기로 처리하기 위해 프로미스 반환
    return new Promise((resolve, reject) => {
        let queries = '';

        // 넘겨받은 옵션으로 요청할 주소의 쿼리스트링 생성
        for (var i in options) {
            queries += `&${encodeURIComponent(i)}=${encodeURIComponent(options[i])}`;
        }

        // API 키 쿼리스트링 지정
        const params = `?${encodeURIComponent('ServiceKey')}=${apikey}${queries}`;

        // jQuery의 ajax를 이용해서 데이터를 받아옴
        $.ajax({
            // 요청할 주소(기본 주소 + 옵션 파라미터)
            url: options.baseUrl + params,

            // 데이터 수신에 성공한 경우 데이터 반환
            success: function (data) {
                resolve(data);
            },

            // 실패할 경우 로딩 화면 해제 및 에러메시지 출력
            error: function () {
                console.error("서버로부터 응답이 잘못 되었습니다.");
                chartAction.hide("응답이 잘못 되었거나 요청 횟수가 너무 많습니다.", "잠시 후 다시 시도해 주세요.")
                chartAction.pending.release();
                reject(Error("error!"));
            }
        });
    });
}

// 차트 관련 함수
var chartAction = {

    // 일시적으로 숨겼던 차트를 보여줌
    show: function () {
        $('#main_chart').css('display', 'flex');
        $('#chart_cover').css('display', 'none');
        $('#chart_cover > h3').html("");
        $('#chart_cover > p').html("");
    },

    // 차트를 감추고 각종 메시지를 보여줌(에러 등등)
    hide: function (coverTitle, coverMsg) {
        $('#main_chart').css('display', 'none');
        $('#chart_cover').css('display', 'flex');
        $('#chart_cover > h3').html(coverTitle);
        $('#chart_cover > p').html(coverMsg);
    },

    // 차트 데이터 변경 후 차트를 다시 그려주는 업데이트 함수
    update: function () {
        mainChart.update();
    },

    // 로딩 화면 띄워주기(차트 위에 로딩중이라는 화면이 보여짐)
    pending: {

        // 로딩화면 설정
        set: function () {
            $('#chart_pending').css('display', 'block');
        },

        // 로딩화면 해제
        release: function () {
            $('#chart_pending').css('display', 'none');
        }
    }
}

// 탭 페이지 관련 함수
var tabPaneAction = {
    makeTabPane: function (target, data) {
        $('.ui.attached.tabular.menu').remove();
        $('.ui.tab.segment').remove();
        $('div.hr').remove();
        makeTabPane(target, data);
    },

    removeTabPane: function () {
        $('.ui.attached.tabular.menu').remove();
        $('.ui.tab.segment').remove();
        $('div.hr').remove();
    },
}

// 표 관련 함수
var tableAction = {
    makeTable: function (target, data) {
        $(`${target} > .ui.tables`).remove();
        makeTable(target, data);
    },

    removeTable: function (target) {
        $(`${target} > .ui.tables`).remove();
    },

    addTable: function (target, data) {
        makeTable(target, data);
    },

    // 로딩 화면 띄워주기(차트 위에 로딩중이라는 화면이 보여짐)
    pending: {

        // 로딩화면 설정
        set: function () {
            $('#chart_pending').css('display', 'block');
        },

        // 로딩화면 해제
        release: function () {
            $('#chart_pending').css('display', 'none');
        }
    }
}

// 차트 기본 구조 만들어 주는 함수
var makeChart = () => {
    var ctx = document.getElementById("main_chart"); // 캔버스 id값 가져오기
    mainChart = new Chart(ctx, {
        type: 'bar', // 그래프 형태 지정하기
        data: {
            labels: [], // X축 제목
            datasets: [{
                label: '미세먼지(pm10) ㎍/m³',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1 // 선굵기
            },
            {
                label: '초미세먼지(pm2.5) ㎍/m³',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1 // 선굵기
            }]
        },
        options: {
            scales: { // X, Y축 옵션
                yAxes: [{
                    ticks: {
                        beginAtZero: true  // Y축의 값이 0부터 시작
                    }
                }]
            },
            title: { // 차트 제목
                display: true,
                fontSize: 18
            }
        }
    });
}

/** https://davidwalsh.name/convert-xml-json 참고함.
 * 공공 데이터 포털에서 가져온 xml 형태의 데이터를 좀 더 가공하기 쉬운 json 데이터로 변환해 주는 함수
*/
var xmlToJson = xml => {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

// 값을 넣으면 적절한 rgba을 반환해 주는 함수
var makeColorSet = (arr, opt) => {
    let colors = {

        // 막대 채움 색
        background: [],

        // 막대 선 색
        border: []
    };

    for (let i = 0; i < arr.length; i++) {
        const d = parseInt(arr[i]);
        let e;

        // 미세먼지 데이터 색 변환(값에 따른 색 기준은 네이버 참고)
        if (opt == 0) {
            if (d <= 30) e = 'rgba(0, 170, 255, 0.333)';
            else if (d > 30 && d <= 80) e = 'rgba(50, 255, 0, 0.333)';
            else if (d > 80 && d <= 150) e = 'rgba(255, 170, 0, 0.333)';
            else e = 'rgba(255, 0, 0, 0.333)';
        }

        // 초미세먼지 데이터 색 변환
        else if (opt == 1) {
            if (d <= 15) e = 'rgba(0, 170, 255, 0.333)';
            else if (d > 15 && d <= 35) e = 'rgba(50, 255, 0, 0.333)';
            else if (d > 35 && d <= 75) e = 'rgba(255, 170, 0, 0.333)';
            else e = 'rgba(255, 0, 0, 0.333)';
        }
        colors.background.push(e);

        if (opt == 0) {
            if (d <= 30) e = 'rgba(0, 170, 255, 0.667)';
            else if (d > 30 && d <= 80) e = 'rgba(50, 255, 0, 0.667)';
            else if (d > 80 && d <= 150) e = 'rgba(255, 170, 0, 0.667)';
            else e = 'rgba(255, 0, 0, 0.667)';
        }
        else if (opt == 1) {
            // if(d <= 15) e = 'rgba(0, 170, 255, 0.667)';
            // else if(d > 15 && d <= 35) e = 'rgba(50, 255, 0, 0.667)';
            // else if(d > 35 && d <= 75) e = 'rgba(255, 170, 0, 0.667)';
            // else e = 'rgba(255, 0, 0, 0.667)';
            e = 'rgba(0, 0, 0, 0.5)';
        }
        colors.border.push(e);
    }

    return colors;
}

var refineJsonData = function (jsonArr) {
    const o = $.extend(true, [], jsonArr);
    let result = [];

    for (var i = 0; i < o.length; i++) {
        // 받아온 데이터가 배열타입인 경우
        if (Array.isArray(o[i].response.body.items.item)) {
            src = o[i].response.body.items.item;
            for (var j = 0; j < src.length; j++) {
                for (var key in src[j]) {
                    if (key === "#text") continue;
                    src[j][key] = src[j][key]["#text"];
                }
                result.push(src[j]);
            }
        }

        // 받아온 데이터가 객체인 경우(결과값이 하나만 반환되는 경우 배열이 아닌 객체로 반환됨)
        else {
            src = o[i].response.body.items.item;
            for (var key in src) {
                if (key === "#text") continue;
                src[key] = src[key]["#text"];
            }
            result.push(src);
        }
    }

    return result;
}

// 탭 헤이지르 만들어 주는 함수
var makeTabPane = function (target, datas) {
    const counts = datas.counts;
    const texts = datas.tabnames;
    const active = datas.active;

    let header = '<div class="ui top attached tabular menu center">'
    let panes = "";

    for (var i = 0; i < counts; i++) {
        header += `<a class="item${(i == active ? ' active' : '')}" data-tab="tab_${i}">${texts[i]}</a>`;
        panes += `<div class="ui bottom attached tab segment${(i == active ? ' active' : '')}" data-tab="tab_${i}"></div>`;
    }

    header += `</div>`;

    $(target).append('<div class="hr"></div>');
    $(target).append(header);
    $(target).append(panes);
    $('.menu .item').tab();
}

// 테이블을 만들어 주는 함수
var makeTable = function (target, datas) {
    const title = datas.title;
    const title_c = datas.title_deco;
    const colNames = datas.columns;
    const rowNames = datas.rows;
    const tDatas = datas.datas;

    let html = `<table class="ui definition table">
        <caption>${title}<span>${title_c}</span></caption>
            <thead>
                <tr>
                    <th></th>`;

    for (var i = 0; i < colNames.length; i++) {
        html += `<th>${colNames[i]}</th>`;
    }

    html += `</tr></thead><tbody>`;

    for (var i = 0; i < rowNames.length; i++) {
        html += `<tr>`;
        html += `<td>${rowNames[i]}</td>`;

        for (var j = 0; j < colNames.length; j++) {
            let txt = '';
            if (tDatas[i][j]) txt = tDatas[i][j];
            html += `<td>${txt}</td>`;
        }
        html += `</tr>`;
    }

    html += `</tbody></table>`;

    $(target).append(html);
}