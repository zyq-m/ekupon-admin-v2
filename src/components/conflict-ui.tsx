type ComparisonLabelProps = {
  uploaded: string
  existed?: string
  isExist: boolean
  isConflict: boolean
}
export const ComparisonLabel = ({
  uploaded,
  existed,
  isExist,
  isConflict,
}: ComparisonLabelProps) => {
  if (uploaded.trim() !== existed?.trim() && isExist && isConflict) {
    return (
      <div>
        <p>{existed}</p>
        <p className="text-red-500">{uploaded}</p>
      </div>
    )
  }

  if (!isExist) {
    return <p className="text-green-500">{uploaded}</p>
  }

  return uploaded
}
