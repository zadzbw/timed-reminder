import React, { type PropsWithChildren, useMemo } from 'react'

interface NumberKeyboardProps {
  value: string
  integerLimit: number
  decimalLimit: number
  onChange: (value: string) => void
  disabled?: boolean
}

interface KeyBoardItemProps {
  value: string
  className?: string
  onClick: (value: string) => void
}

const getInputValue = (s: string) => {
  // 1. match number
  if (/^[0-9]*[.,。，]?[0-9]*$/.test(s)) {
    // 2. replace dot
    const inputValue = s.replace(/[,。，]/g, '.')
    // 3. match decimal, ensure user can input xx.00000y
    if (/^[0-9]+\./.test(inputValue)) {
      return inputValue
    }
    // 4. match . or .xxx
    if (/^\./.test(inputValue)) {
      return `0${inputValue}`
    }
    return `${Number(inputValue || '0').toString()}`
  }
  return null
}

interface KeyBoardItemPropsWithDisabled extends KeyBoardItemProps {
  disabled?: boolean
}

const KeyBoardItem: React.FC<PropsWithChildren<KeyBoardItemPropsWithDisabled>> = ({
  value,
  onClick,
  children,
  disabled,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(value)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className="btn btn-ghost h-12 text-lg font-semibold transition-all duration-100 ease-out active:translate-y-0.5 active:scale-[0.95] active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleClick}
    >
      {children || value}
    </button>
  )
}

const DeleteKeyBoardItem: React.FC<Omit<KeyBoardItemProps, 'value'> & { disabled?: boolean }> = ({
  onClick,
  disabled,
}) => {
  return (
    <KeyBoardItem value="del" onClick={onClick} disabled={disabled}>
      ⌫
    </KeyBoardItem>
  )
}

export const NumberKeyboard: React.FC<NumberKeyboardProps> = ({
  value,
  onChange,
  integerLimit,
  decimalLimit,
  disabled = false,
}) => {
  const notDecimal = decimalLimit <= 0

  const keys = useMemo(() => {
    if (notDecimal) {
      return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0']
    }
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0']
  }, [notDecimal])

  const handleInput = (newKey: string) => {
    const inputValue = getInputValue(value + newKey)
    if (inputValue) {
      const [integer, decimal] = inputValue.split('.')
      if (integer.length > integerLimit || (decimal && decimal.length > decimalLimit)) {
        return
      }
      onChange(inputValue)
    }
  }

  const handleDelete = () => {
    onChange(value.slice(0, -1) || '0')
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="form-control">
          <label className="label">
            <span className="label-text">定时间隔（分钟）</span>
          </label>
          <div className="input input-bordered flex min-h-[3rem] w-full items-center justify-end text-right text-lg font-semibold">
            {value || '0'}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 grid-rows-4 gap-2">
          {keys.map((key) => {
            if (key === '') {
              return <div key="empty" />
            }
            return <KeyBoardItem key={key} value={key} onClick={handleInput} disabled={disabled} />
          })}
          <DeleteKeyBoardItem onClick={handleDelete} disabled={disabled} />
        </div>
      </div>
    </div>
  )
}
