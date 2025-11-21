import FragebogenTable, { type FragebogenRow } from "../components/fragebogen";

function sayHiInChat(){
    console.log("ohaio sekai");
}

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("ohaio sekai");
}

const mockRowData: FragebogenRow[] = [
    {id: 1, question: "do your teammates wear wigs?", type: 'grade'},
    {id: 2, question: "will your teammates wear wigs?", type: 'grade'},
    {id: 3, question: "when will they wear wigs?", type: 'text'},
];
const mockNames: string[] = ["Jimbo James", "Big Badinky Bones", "The Cartel"];

export default function Test(){
    return <FragebogenTable 
        onSubmit={handleSubmit}
        rows={mockRowData}
        studentNames={mockNames}
    />;
}