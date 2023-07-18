import Chip from "@mui/material/Chip";
import Card from '@mui/material/Card';
import danny_dominguez_dev from './images/danny_dominguez_dev.png'
import loteria_ios from './images/loteria_ios.png'
import loteria_android from './images/loteria_android.png'
import conversational_agent from './images/conversational_agent.png'


const projects = [
    {
        name: 'dannydominguez.dev',
        company: 'Personal',
        image: danny_dominguez_dev,
        website: 'https://github.com/danieldominguez8/personalwebsite',
        tags: ['React', 'AWS', 'Amplify', 'GitHub', 'JavaScript', 'HTML', 'CSS']
    },
    {
        name: 'Loteria iOS',
        company: 'Personal',
        image: loteria_ios,
        website: 'https://apps.apple.com/us/app/loter%C3%ADa-tradicional/id1612279702?platform=iphone',
        tags: ['React Native', 'iOS', 'Swift',]
    },
    {
        name: 'Loteria Android',
        company: 'Personal',
        image: loteria_android,
        website: 'https://play.google.com/store/apps/details?id=com.loteriadominguez&hl=en&gl=US',
        tags: ['React Native', 'Android', 'Java',]
    },
    {
        name: 'Conversational Agent',
        company: 'Drexel University',
        image: conversational_agent,
        website: 'https://github.com/shaquille-hall/se691-conversational-agent',
        tags: ['React Native', 'Firebase', 'NoSQL', 'iOS', 'Python', 'JavaScript']
    }
];

let projectsList = [];
projects.forEach((project, index) => {
    projectsList.push(
        <Card className="cards" >
            <h2 className="project-name">{project.name}</h2>
            <p className="project-company">{project.company}</p>
            <a href={project.website} target="_blank" rel="noreferrer"><img class="project-img" alt={project.name} src={project.image} /></a>
            <p className="project-tags-container">{project.tags.map((val, index) => {
                return (
                    <Chip className="chips" key={index} label={val} />
                );
            })}</p>
        </Card>
    )
})

export const projectList = projectsList;


const skills = ['.NET', 'C#', 'Visual Basic', 'NUnit', 'xUnit', 'Moq', 'React', 'React Native', 'Java', 'JavaScript', 'Amplify', 'Python', 'C++', 'NoSQL', 'Dialogflow', 'Android', 'iOS', 'HTML', 'CSS', 'Unit testing', 'TDD', 'Agile'];
let skillsList = [];
skills.forEach((skill, index) => {
    skillsList.push(<Chip key={index} className="chips" label={skill} />)
})

export const skillList = skillsList;
