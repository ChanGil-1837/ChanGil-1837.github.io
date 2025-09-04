export default function ProjectItem(data:any) {

    const title = data.project.title
    const description = data.project.description
    const imgSrc =data.project.cover
    const github = data.project.link
    const tags = data.project.tags
    const start = data.project.start
    const end = data.project.end

    const calculatedPeriod = (start:string, end:string) => {
        const startDateStringArray = start.split('-');
        const endDateStringArray = end.split('-');

        var startDate = new Date(Number(startDateStringArray[0]), Number(startDateStringArray[1]), Number(startDateStringArray[2]));
        var endDate = new Date(Number(endDateStringArray[0]), Number(endDateStringArray[1]), Number(endDateStringArray[2]));

        const diffInMs = Math.abs(endDate.getTime() - startDate.getTime());
        const result = diffInMs / (1000 * 60 * 60 * 24);
        return result;
    };

    function chunkTags(tags :any, size:number) {
        return tags.reduce((resultArray:any, item:any, index:number) => { 
            const chunkIndex = Math.floor(index / size);
    
            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []; // 시작 지점
            }
    
            resultArray[chunkIndex].push(item);
    
            return resultArray;
        }, []);
    }

    return (
        <a href={github} target="_blank" rel="noopener noreferrer">
            <div className="project-card">
            <img
                className="rounded-t-xl"
                src={imgSrc}
                alt='Cover Img'
                style={{ width: '100%', height: '50%', objectFit: 'cover' }}
            />

                    <div className="p-4 flex flex-col">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <h3 className="mt-4 text-xl">{description}</h3>
                        <p className="my-1 ">
                            작업기간 : {start} ~ {end} ({calculatedPeriod(start, end)}일)
                        </p>
                        <div className="mt-2">
                        {chunkTags(tags, 5).map((chunk:any, index:number) => (
                            <div key={index} className="flex items-start">
                                {chunk.map((aTag:any) => (
                                    <h1 key={aTag.id} className="px-2 py-1 mr-2 rounded-md bg-sky-200 dark:bg-sky-700 w-30">
                                        {aTag.name}
                                    </h1>
                                ))}
                            </div>
                        ))}
                        </div>

                    </div>

                </div>
        </a>
    );
}