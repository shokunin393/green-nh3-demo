import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { FileDown, Upload } from 'lucide-react'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function GreenNH3Demo() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [format, setFormat] = useState('xlsx')

  const sampleData = [
    { id: 'GH3-001', issuer: 'GreenAmmonia Corp', holder: 'Nippon Energy', status: '発行済', amount: 100, price: 1200000 },
    { id: 'GH3-002', issuer: 'EcoChem Inc', holder: 'Maritime Fuel Ltd', status: '移転済', amount: 80, price: 960000 },
    { id: 'GH3-003', issuer: 'GreenAmmonia Corp', holder: 'Tokyo Power', status: '償却済', amount: 50, price: 600000 },
  ]

  const handleSample = () => {
    console.log({ event: 'sample_start' })
    setLoading(true)
    setTimeout(() => {
      setData(sampleData)
      setLoading(false)
      console.log({ event: 'sample_loaded' })
    }, 3000)
  }

  const handleDownload = async () => {
    const fileName = `証書台帳_グリーンNH3レジストリ_${new Date().toISOString().slice(0,16).replace(/[-:T]/g, '')}`
    console.log({ event: 'download', format })

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '証書台帳')
      XLSX.writeFile(wb, `${fileName}.xlsx`)
    } else if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', RS: '\n' })
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.csv`
      link.click()
    } else if (format === 'pdf') {
      const element = document.getElementById('preview')
      if (!element) return
      const canvas = await html2canvas(element)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${fileName}.pdf`)
    }
  }

  const contactUrl = `https://shokunin-san-com.studio.site/AI-form1${location.search}`

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="font-bold text-lg">グリーンNH3レジストリ</h1>
        <Button onClick={() => {console.log({ event: 'cta_click', cta: 'header' }); window.open(contactUrl, '_blank')}}>
          この仕組みについて問い合わせる
        </Button>
      </header>

      {/* Demo Section */}
      <section className="w-full max-w-6xl mt-6 grid md:grid-cols-2 gap-4">
        {/* Left Side */}
        <Card className="flex flex-col items-center justify-center p-6 text-center border-dashed border-2 border-gray-300">
          <Upload className="w-10 h-10 mb-2" />
          <p className="mb-2">ここにCSV/JSONファイルをドロップ</p>
          <Button aria-label="サンプル証書で試す" onClick={handleSample} disabled={loading}>
            サンプル証書で試す
          </Button>
          {loading && <Progress value={70} className="mt-4 w-2/3" />}
        </Card>

        {/* Right Side */}
        <Card className="p-4">
          <CardContent>
            {data.length === 0 ? (
              <p className="text-gray-500">左の「サンプル証書で試す」から開始してください。</p>
            ) : (
              <div id="preview">
                <h2 className="font-bold text-xl mb-4">証書台帳プレビュー</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>証書ID</TableHead>
                      <TableHead>発行者</TableHead>
                      <TableHead>保有者</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>数量[t]</TableHead>
                      <TableHead>価格[JPY]</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.issuer}</TableCell>
                        <TableCell>{row.holder}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>{row.price.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {data.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="出力形式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  </SelectContent>
                </Select>
                <Button aria-label="証書台帳をダウンロード" onClick={handleDownload}>
                  <FileDown className="w-4 h-4 mr-2" />証書台帳をダウンロード
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center px-4 py-3">
        <p className="text-sm">本番PoC・API連携デモのご相談はこちら</p>
        <Button onClick={() => {console.log({ event: 'cta_click', cta: 'sticky' }); window.open(contactUrl, '_blank')}}>
          問い合わせ
        </Button>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p>運営元：株式会社 職人さんドットコム</p>
        <p>〒220-0004 神奈川県横浜市西区北幸2丁目10-28 むつみビル3F</p>
        <p>info@shokunin-san.com / 03-6823-3524</p>
      </footer>
    </main>
  )
}
