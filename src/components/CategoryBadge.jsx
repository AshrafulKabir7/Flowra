import { getCategoryLabel } from '../utils/helpers'

export default function CategoryBadge({ category }) {
    return (
        <span className={`badge badge-${category || 'other'}`}>
            {getCategoryLabel(category)}
        </span>
    )
}
