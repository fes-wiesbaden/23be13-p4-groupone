import FragebogenTable, { type FragebogenRow } from "../components/fragebogen";

function sayHiInChat(){
    console.log("ohaio sekai");
}

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    console.log(formData);
}

const mockRowData: FragebogenRow[] = [
    {id: "1", question: "do your teammates wear wigs?", type: 'grade'},
    {id: "3", question: "when will they wear wigs?", type: 'text'},
    {id: "5", question: "when will they wear wigs? spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam spam", type: 'grade'},
    {id: "2", question: "will your teammates wear wigs?", type: 'grade'},
    {id: "67", question: "rattatouie?", type: 'text'},
];
const mockNames: string[] = ["Jimbo James", "Big Badinky Bones", "The Cartel", "Megatron"];

export default function Test(){
    return <FragebogenTable 
        onSubmit={handleSubmit}
        rows={mockRowData}
        studentNames={mockNames}
        editView
    />;
}