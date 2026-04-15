const inputClass =
  'w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors bg-white'
const labelClass = 'block text-[12px] font-medium text-[#5c5c5c] mb-1'

interface JobFormFieldsProps {
  spots: { id: string; name: string }[]
  showStatus?: boolean
  defaultValues?: {
    title?: string | null
    type?: string | null
    spot_id?: string | null
    salary_range?: string | null
    description?: string | null
    requirements?: string | null
    contact_info?: string | null
    status?: string | null
  }
}

export default function JobFormFields({
  spots,
  showStatus = false,
  defaultValues = {},
}: JobFormFieldsProps) {
  return (
    <>
      {/* タイトル */}
      <div>
        <label className={labelClass}>
          求人タイトル <span className="text-[#d94f4f]">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={defaultValues.title ?? ''}
          placeholder="例: 食堂スタッフ募集（パートタイム）"
          className={inputClass}
        />
      </div>

      {/* 種別 + スポット */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>種別</label>
          <select
            name="type"
            defaultValue={defaultValues.type ?? 'regular'}
            className={inputClass}
          >
            <option value="regular">正規・パート</option>
            <option value="seasonal">季節</option>
            <option value="volunteer">地域おこし協力隊</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>関連スポット</label>
          <select
            name="spot_id"
            defaultValue={defaultValues.spot_id ?? ''}
            className={inputClass}
          >
            <option value="">選択しない</option>
            {spots.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 給与 */}
      <div>
        <label className={labelClass}>給与・報酬</label>
        <input
          name="salary_range"
          type="text"
          maxLength={100}
          defaultValue={defaultValues.salary_range ?? ''}
          placeholder="例: 時給1,100円〜 / 月給200,000円〜"
          className={inputClass}
        />
      </div>

      {/* 仕事内容 */}
      <div>
        <label className={labelClass}>仕事内容</label>
        <textarea
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={defaultValues.description ?? ''}
          placeholder="仕事の内容・特徴を記載してください"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* 応募条件 */}
      <div>
        <label className={labelClass}>応募条件</label>
        <textarea
          name="requirements"
          rows={3}
          maxLength={1000}
          defaultValue={defaultValues.requirements ?? ''}
          placeholder="必要な資格・経験・条件など"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* 連絡先 */}
      <div>
        <label className={labelClass}>お問い合わせ先</label>
        <input
          name="contact_info"
          type="text"
          maxLength={200}
          defaultValue={defaultValues.contact_info ?? ''}
          placeholder="例: 電話 0137-XX-XXXX / メール info@example.com"
          className={inputClass}
        />
      </div>

      {/* ステータス（admin only） */}
      {showStatus && (
        <div>
          <label className={labelClass}>ステータス</label>
          <select
            name="status"
            defaultValue={defaultValues.status ?? 'open'}
            className={inputClass}
          >
            <option value="open">募集中</option>
            <option value="closed">募集停止</option>
          </select>
        </div>
      )}
    </>
  )
}
