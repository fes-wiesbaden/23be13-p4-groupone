import FragebogenTable from "../components/fragebogen";

function sayHiInChat(){
    console.log("ohaio sekai");
}

export default function Test(){
    return <FragebogenTable 
        onSubmit={sayHiInChat}
    />;
}