export default function CourseItem({ course, isSelected, onToggleSelect }) {
    const crn = course[3];

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(crn)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {course[4]} {course[5]} - {course[6]}
                    </h3>
                    <p className="text-gray-700 font-medium mb-2">{course[7]}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">CRN:</span> {crn}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}