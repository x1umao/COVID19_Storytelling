
// const source = "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time tozz get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me."
const stopwords = new Set("i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(","))

let source;
let words;
let data;
d3.text("data/wc.txt").then(d => {
    console.log(typeof (d))
    source = d;
});

function renderWc() {

    words = source.split(/[\s.]+/g)
        .map(w => w.replace(/^[“‘"\-—()\[\]{}]+/g, ""))
        .map(w => w.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, ""))
        .map(w => w.replace(/['’]s$/g, ""))
        .map(w => w.substring(0, 30))
        .map(w => w.toLowerCase())
        .filter(w => w && !stopwords.has(w));

    data = d3.rollups(words, group => group.length, w => w)
        .sort(([, a], [, b]) => d3.descending(a, b))
        .slice(0, 250)
        .filter(([text, value]) => value > 1)
        .map(([text, value]) => ({ text, value }));

    s = d3.scaleSqrt()
        .domain([1, d3.max(data.map(d => d.value))])
        .range([6, 82]);
    let height = 300
    let width = 600
    let padding = 0




    const fontFamily = "Verdana, Arial, Helvetica, sans-serif";

    const svg = d3.select("#wc_container")
        .append("svg")
        .attr("id", "word-cloud")
        .attr("viewBox", [0, 0, width, height])
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle");

    const displaySelection = svg
        .append("text")
        .attr("font-family", "Lucida Console, Courier, monospace")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "hanging")
        .attr("x", 10)
        .attr("y", 10);

    const cloud = d3.layout.cloud()
        .size([width, height])
        .words(data.map(d => Object.create(d)))
        .padding(0)
        .rotate(() => 0)
        .font(fontFamily)
        .fontSize(d => s(d.value))
        .on("word", ({ size, x, y, rotate, text }) => {
            svg.append("text")
                .attr("font-size", size)
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .text(text)
                .classed("click-only-text", true)
                .classed("word-default", true)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
            // .on("click", handleClick);

            function handleMouseOver(d, i) {
                d3.select(this)
                    .classed("word-hovered", true)
                    .transition(`mouseover-${text}`).duration(200).ease(d3.easeLinear)
                    .attr("font-size", size + 2)
                    .attr("font-weight", "bold");
            }

            function handleMouseOut(d, i) {
                d3.select(this)
                    .classed("word-hovered", false)
                    .interrupt(`mouseover-${text}`)
                    .attr("font-size", size);
            }
            // function handleClick(d, i) {
            //     var e = d3.select(this);
            //     // displaySelection.text(`selection="${e.text()}"`);
            //     // e.classed("word-selected", !e.classed("word-selected"));
            // }


        });

    cloud
    .start();
    // invalidation.then(() => cloud.stop());
}

