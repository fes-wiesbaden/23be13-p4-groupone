import FragebogenTable from "../components/fragebogen";

function sayHiInChat(){
    console.log("ohaio sekai");
}

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("ohaio sekai");
}

export default function Test(){
    return <FragebogenTable 
        onSubmit={handleSubmit}
    />;
}