// Ported from tredro-dashborad/assets/icons/iconRenderer
import type { ComponentType, SVGProps } from 'react'
import { ArrowLeftOutlined } from '../arrow_left_outlined'
import { ArrowRightOutlined } from '../arrow_right_outlined'
import { BinOutlined } from '../bin_outlined'
import { CloseOutlined } from '../close_outlined'
import { CurrencyUsd } from '../currency_usd'
import { ExternalOutlined } from '../external_outlined'
import { GlobeOutlined } from '../globe_outlined'
import { LiveOutlined } from '../live_outlined'
import { MapOutlined } from '../map_outlined'
import { MoneyOutlined } from '../money_outlined'
import { MoonOutlined } from '../moon_outlined'
import { MorningSunOutlined } from '../morning_sun_outlined'
import { PlusOutlined } from '../plus_outlined'
import { RefreshOutlined } from '../refresh_outlined'
import { ReportOutlined } from '../report_outlined'
import { SalesOutlined } from '../sales_outlined'
import { SearchErrorOutlined } from '../search_error_outlined'
import { SearchOutlined } from '../search_outlined'
import { StarFilled } from '../star_filled'
import { StarOutlined } from '../star_outlined'
import { WarningOutlined } from '../warning_outlined'
import { cn } from '@/lib/utils/cn'
import type { iconName } from './types'

/**
 * Static map: the icons are a few hundred bytes each, so importing them
 * directly keeps IconRenderer a Server Component and puts the SVG in the
 * server HTML (no client chunk per icon, no empty placeholder before hydration).
 */
const icons: Record<iconName, ComponentType<SVGProps<SVGSVGElement>>> = {
  arrow_left_outlined: ArrowLeftOutlined,
  arrow_right_outlined: ArrowRightOutlined,
  bin_outlined: BinOutlined,
  close_outlined: CloseOutlined,
  currency_usd: CurrencyUsd,
  external_outlined: ExternalOutlined,
  globe_outlined: GlobeOutlined,
  live_outlined: LiveOutlined,
  map_outlined: MapOutlined,
  money_outlined: MoneyOutlined,
  moon_outlined: MoonOutlined,
  morning_sun_outlined: MorningSunOutlined,
  plus_outlined: PlusOutlined,
  refresh_outlined: RefreshOutlined,
  report_outlined: ReportOutlined,
  sales_outlined: SalesOutlined,
  search_error_outlined: SearchErrorOutlined,
  search_outlined: SearchOutlined,
  star_filled: StarFilled,
  star_outlined: StarOutlined,
  warning_outlined: WarningOutlined,
}

interface IconProps extends SVGProps<SVGSVGElement> {
  name: iconName
}

export function IconRenderer({ name, className, width, height, color, ...props }: IconProps) {
  const Icon = icons[name]
  const hasExplicitDimensions = width !== undefined || height !== undefined

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', !hasExplicitDimensions && 'size-5', className)}
      style={hasExplicitDimensions ? { width: width ?? 20, height: height ?? 20 } : undefined}
    >
      <Icon
        {...props}
        width="100%"
        height="100%"
        color={color ?? 'currentColor'}
        className={cn('block size-full', className)}
      />
    </span>
  )
}
